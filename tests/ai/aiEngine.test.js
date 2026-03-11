const AIEngine = require('../../backend/services/AIEngine');

describe('AI Engine', () => {
  beforeEach(() => {
    // Reset AI Engine state
    AIEngine.context.clear();
  });

  test('should analyze command error', async () => {
    const command = 'git psh';
    const error = 'git: \'psh\' is not a git command';
    
    const result = await AIEngine.analyzeCommandError(command, error);
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('suggestion');
    expect(result).toHaveProperty('confidence');
  });

  test('should provide fallback for common errors', () => {
    const command = 'git psh';
    const error = 'command not found';
    
    const result = AIEngine.getFallbackSuggestion(command, error);
    
    expect(result.fallback).toBe(true);
    expect(result.suggestion).toBeTruthy();
  });

  test('should calculate confidence scores', () => {
    const highConfSuggestion = 'Try: git push origin main\nThis will push your changes';
    const lowConfSuggestion = 'Check syntax';
    
    expect(AIEngine.calculateConfidence(highConfSuggestion)).toBeGreaterThan(0.7);
    expect(AIEngine.calculateConfidence(lowConfSuggestion)).toBeLessThan(0.7);
  });

  test('should extract severity from analysis', () => {
    const highAnalysis = 'HIGH severity issue detected';
    const mediumAnalysis = 'MEDIUM priority warning';
    const lowAnalysis = 'minor issue found';
    
    expect(AIEngine.extractSeverity(highAnalysis)).toBe('HIGH');
    expect(AIEngine.extractSeverity(mediumAnalysis)).toBe('MEDIUM');
    expect(AIEngine.extractSeverity(lowAnalysis)).toBe('LOW');
  });

  test('should suggest install commands', () => {
    expect(AIEngine.suggestInstallCommand('git')).toContain('apt-get');
    expect(AIEngine.suggestInstallCommand('node')).toContain('nodejs.org');
    expect(AIEngine.suggestInstallCommand('unknown')).toContain('Install');
  });
});