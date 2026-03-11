const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const log = require('../utils/logger');
const DatabaseService = require('../database/DatabaseService');
const EventEmitter = require('events');

/**
 * AI Engine Service
 * Handles command analysis, suggestions, and natural language processing
 * Supports both local Ollama and OpenAI API
 */
class AIEngine extends EventEmitter {
  constructor() {
    super();
    this.db = DatabaseService.getInstance();
    this.config = {
      provider: process.env.AI_PROVIDER || 'ollama', // 'ollama' or 'openai'
      model: process.env.AI_MODEL || 'codellama', // or 'gpt-4'
      ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      openaiKey: process.env.OPENAI_API_KEY,
      temperature: 0.3,
      maxTokens: 500
    };
    
    this.isAvailable = false;
    this.context = new Map(); // Store conversation context
    this.commandPatterns = this.loadCommandPatterns();
    
    this.init();
  }

  /**
   * Initialize AI engine
   */
  async init() {
    try {
      if (this.config.provider === 'ollama') {
        await this.checkOllamaConnection();
      } else if (this.config.provider === 'openai') {
        await this.checkOpenAIConnection();
      }
      
      this.isAvailable = true;
      log.info(`AI Engine initialized with provider: ${this.config.provider}`);
      
      // Load command patterns
      await this.loadCommandPatterns();
      
    } catch (error) {
      log.error('Failed to initialize AI Engine:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Check Ollama connection
   */
  async checkOllamaConnection() {
    try {
      const response = await axios.get(`${this.config.ollamaUrl}/api/tags`);
      const models = response.data.models || [];
      
      // Check if required model exists
      const modelExists = models.some(m => m.name.includes(this.config.model));
      
      if (!modelExists) {
        log.warn(`Model ${this.config.model} not found. Pulling...`);
        await this.pullOllamaModel();
      }
      
      return true;
    } catch (error) {
      throw new Error(`Ollama not available: ${error.message}`);
    }
  }

  /**
   * Pull Ollama model
   */
  async pullOllamaModel() {
    return new Promise((resolve, reject) => {
      const pull = spawn('ollama', ['pull', this.config.model]);
      
      pull.stdout.on('data', (data) => {
        log.info(`Pulling model: ${data}`);
        this.emit('progress', data.toString());
      });
      
      pull.stderr.on('data', (data) => {
        log.error(`Pull error: ${data}`);
      });
      
      pull.on('close', (code) => {
        if (code === 0) {
          log.info(`Model ${this.config.model} pulled successfully`);
          resolve();
        } else {
          reject(new Error(`Failed to pull model: ${code}`));
        }
      });
    });
  }

  /**
   * Check OpenAI connection
   */
  async checkOpenAIConnection() {
    if (!this.config.openaiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.status === 200;
    } catch (error) {
      throw new Error(`OpenAI connection failed: ${error.message}`);
    }
  }

  /**
   * Load command patterns from file
   */
  async loadCommandPatterns() {
    try {
      const patternsPath = path.join(__dirname, '../../../ai/prompts/commandPatterns.json');
      const data = await fs.readFile(patternsPath, 'utf8');
      this.commandPatterns = JSON.parse(data);
    } catch (error) {
      log.warn('Could not load command patterns, using defaults');
      this.commandPatterns = {
        git: ['push', 'pull', 'commit', 'status', 'branch', 'merge'],
        npm: ['install', 'start', 'build', 'test', 'run'],
        docker: ['ps', 'images', 'run', 'stop', 'rm'],
        system: ['ls', 'cd', 'pwd', 'cp', 'mv', 'rm', 'cat', 'grep']
      };
    }
  }

  /**
   * Analyze command error and suggest fix
   */
  async analyzeCommandError(command, error, context = {}) {
    try {
      if (!this.isAvailable) {
        return this.getFallbackSuggestion(command, error);
      }

      const prompt = this.buildErrorAnalysisPrompt(command, error, context);
      const suggestion = await this.queryAI(prompt);
      
      // Store in database
      await this.storeSuggestion(command, error, suggestion);
      
      return {
        success: true,
        originalCommand: command,
        error: error,
        suggestion: suggestion,
        confidence: this.calculateConfidence(suggestion),
        timestamp: new Date().toISOString()
      };
      
    } catch (aiError) {
      log.error('AI analysis failed:', aiError);
      return this.getFallbackSuggestion(command, error);
    }
  }

  /**
   * Build error analysis prompt
   */
  buildErrorAnalysisPrompt(command, error, context) {
    return `
You are an expert system administrator and developer assistant. 
Analyze this failed command and provide a helpful suggestion.

Command: ${command}
Error: ${error}

Context:
- Current directory: ${context.cwd || 'unknown'}
- Operating System: ${context.platform || 'unknown'}
- Previous commands: ${(context.history || []).slice(-3).join(' -> ')}

Provide a concise fix suggestion in this format:
1. What went wrong (one line)
2. The corrected command
3. Brief explanation

Keep the response under 100 words and focus on practical solutions.
`;
  }

  /**
   * Query AI provider
   */
  async queryAI(prompt) {
    if (this.config.provider === 'ollama') {
      return this.queryOllama(prompt);
    } else {
      return this.queryOpenAI(prompt);
    }
  }

  /**
   * Query Ollama
   */
  async queryOllama(prompt) {
    try {
      const response = await axios.post(`${this.config.ollamaUrl}/api/generate`, {
        model: this.config.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens
        }
      });

      return response.data.response;
    } catch (error) {
      log.error('Ollama query failed:', error);
      throw error;
    }
  }

  /**
   * Query OpenAI
   */
  async queryOpenAI(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert system administrator and developer assistant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      log.error('OpenAI query failed:', error);
      throw error;
    }
  }

  /**
   * Get fallback suggestion when AI is unavailable
   */
  getFallbackSuggestion(command, error) {
    // Simple pattern matching for common errors
    let suggestion = null;
    
    if (error.includes('command not found')) {
      const cmd = command.split(' ')[0];
      suggestion = this.suggestInstallCommand(cmd);
    } else if (error.includes('Permission denied')) {
      suggestion = `Try: sudo ${command}`;
    } else if (error.includes('No such file')) {
      suggestion = 'Check if the file path is correct';
    } else if (error.includes('git') && error.includes('not a git repository')) {
      suggestion = 'Initialize git repository first: git init';
    }

    return {
      success: false,
      originalCommand: command,
      error: error,
      suggestion: suggestion || 'Check command syntax and try again',
      confidence: 0.3,
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Suggest install command for missing programs
   */
  suggestInstallCommand(cmd) {
    const installCommands = {
      'git': 'apt-get install git (Ubuntu) or brew install git (Mac)',
      'node': 'Install Node.js from https://nodejs.org',
      'npm': 'Installed with Node.js',
      'python': 'apt-get install python or brew install python',
      'docker': 'Install Docker from https://docker.com',
      'curl': 'apt-get install curl or brew install curl',
      'wget': 'apt-get install wget or brew install wget'
    };
    
    return installCommands[cmd] || `Install ${cmd} using your package manager`;
  }

  /**
   * Calculate confidence score for suggestion
   */
  calculateConfidence(suggestion) {
    // Simple confidence calculation based on suggestion quality
    let score = 0.7; // Base score
    
    if (suggestion.includes('```')) score += 0.1; // Has code block
    if (suggestion.length > 20) score += 0.1; // Detailed
    if (suggestion.includes('error') || suggestion.includes('fix')) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Store suggestion in database
   */
  async storeSuggestion(command, error, suggestion) {
    try {
      await this.db.run(`
        INSERT INTO ai_suggestions 
        (command, error_message, suggestion, timestamp, used_count)
        VALUES (?, ?, ?, ?, 0)
      `, [command, error, suggestion, new Date().toISOString()]);
    } catch (dbError) {
      log.error('Failed to store suggestion:', dbError);
    }
  }

  /**
   * Get command suggestion from natural language
   */
  async getCommandFromNaturalLanguage(input) {
    try {
      const prompt = `
Convert this natural language request into a shell command:
"${input}"

Provide only the command, no explanation.
Example: "show all files in current directory" -> "ls -la"
`;

      const command = await this.queryAI(prompt);
      return command.trim();
    } catch (error) {
      log.error('Natural language processing failed:', error);
      return null;
    }
  }

  /**
   * Analyze system log for issues
   */
  async analyzeSystemLogs(logs, type = 'error') {
    try {
      const prompt = `
Analyze these system ${type} logs and identify potential issues:

${logs.slice(0, 10).join('\n')}

Provide:
1. Main issues detected
2. Severity level (LOW/MEDIUM/HIGH)
3. Recommended actions
`;

      const analysis = await this.queryAI(prompt);
      
      return {
        analysis,
        severity: this.extractSeverity(analysis),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      log.error('Log analysis failed:', error);
      return null;
    }
  }

  /**
   * Extract severity from analysis
   */
  extractSeverity(analysis) {
    if (analysis.includes('HIGH') || analysis.includes('critical')) return 'HIGH';
    if (analysis.includes('MEDIUM') || analysis.includes('warning')) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Get popular commands for context
   */
  async getPopularCommands(limit = 10) {
    return this.db.all(`
      SELECT command, COUNT(*) as count 
      FROM command_logs 
      WHERE timestamp > datetime('now', '-7 days')
      GROUP BY command 
      ORDER BY count DESC 
      LIMIT ?
    `, [limit]);
  }

  /**
   * Get successful suggestions
   */
  async getSuccessfulSuggestions(limit = 5) {
    return this.db.all(`
      SELECT * FROM ai_suggestions 
      WHERE used_count > 0 
      ORDER BY used_count DESC, timestamp DESC 
      LIMIT ?
    `, [limit]);
  }
}

module.exports = new AIEngine();