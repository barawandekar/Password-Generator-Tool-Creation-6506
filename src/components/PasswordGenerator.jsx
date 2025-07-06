import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiRefreshCw, FiCheck, FiEye, FiEyeOff, FiLock, FiPlus, FiX, FiType, FiKey, FiEdit3 } from 'react-icons/fi';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [generationType, setGenerationType] = useState('password'); // 'password' or 'passphrase'
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    customSymbols: false
  });
  const [passphraseOptions, setPassphraseOptions] = useState({
    wordCount: 4,
    separator: '-',
    customSeparator: '',
    includeNumbers: false,
    minNumberCount: 1,
    capitalize: false,
    lengthType: 'word-count',
    targetLength: 20
  });
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [customSymbols, setCustomSymbols] = useState('');
  const [showCustomSymbolInput, setShowCustomSymbolInput] = useState(false);
  const [showCustomSeparatorInput, setShowCustomSeparatorInput] = useState(false);

  const defaultSymbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Common word list for passphrases
  const wordList = [
    'apple', 'banana', 'cherry', 'dragon', 'elephant', 'falcon', 'guitar', 'harbor',
    'island', 'jungle', 'kitten', 'lemon', 'mountain', 'ocean', 'piano', 'quartz',
    'rainbow', 'sunset', 'tiger', 'umbrella', 'valley', 'wizard', 'yellow', 'zebra',
    'bridge', 'castle', 'flower', 'garden', 'happy', 'magic', 'nature', 'purple',
    'river', 'silver', 'thunder', 'winter', 'bright', 'cloud', 'dream', 'forest',
    'golden', 'honest', 'journey', 'kindness', 'light', 'moon', 'noble', 'peace',
    'quiet', 'royal', 'star', 'truth', 'unique', 'voice', 'wisdom', 'youth'
  ];

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let chars = '';
    if (options.lowercase) chars += lowercase;
    if (options.uppercase) chars += uppercase;
    if (options.numbers) chars += numbers;
    if (options.symbols) chars += defaultSymbols;
    if (options.customSymbols && customSymbols) chars += customSymbols;

    if (chars === '') {
      setPassword('');
      return;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const getCurrentSeparator = () => {
    return passphraseOptions.separator === 'custom' 
      ? passphraseOptions.customSeparator 
      : passphraseOptions.separator;
  };

  const generatePassphraseByWordCount = () => {
    const { wordCount, capitalize, includeNumbers, minNumberCount } = passphraseOptions;
    const separator = getCurrentSeparator();
    
    let selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      let word = wordList[randomIndex];
      
      if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      selectedWords.push(word);
    }
    
    let result = selectedWords.join(separator);
    
    // Add numbers if needed
    if (includeNumbers) {
      const parts = result.split(separator);
      const resultParts = [];
      let numbersAdded = 0;
      
      for (let i = 0; i < parts.length; i++) {
        resultParts.push(parts[i]);
        
        if (i < parts.length - 1 && numbersAdded < minNumberCount) {
          const randomNum = Math.floor(Math.random() * 10);
          resultParts.push(randomNum.toString());
          numbersAdded++;
        }
      }
      
      result = resultParts.join(separator);
    }
    
    return result;
  };

  const generatePassphraseByLength = () => {
    const { targetLength, capitalize, includeNumbers, minNumberCount } = passphraseOptions;
    const separator = getCurrentSeparator();
    
    let bestResult = '';
    let bestDifference = Infinity;
    const maxAttempts = 100;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let selectedWords = [];
      let currentLength = 0;
      
      // Build passphrase word by word
      while (currentLength < targetLength) {
        const availableWords = wordList.filter(word => {
          const processedWord = capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
          const nextLength = currentLength + (selectedWords.length > 0 ? separator.length : 0) + processedWord.length;
          
          // Reserve space for numbers if needed
          const numbersSpace = includeNumbers ? minNumberCount * (separator.length + 1) : 0;
          
          return nextLength + numbersSpace <= targetLength;
        });
        
        if (availableWords.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        let word = availableWords[randomIndex];
        
        if (capitalize) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        
        selectedWords.push(word);
        currentLength += (selectedWords.length === 1 ? 0 : separator.length) + word.length;
      }
      
      if (selectedWords.length === 0) continue;
      
      let result = selectedWords.join(separator);
      
      // Add numbers if needed
      if (includeNumbers && selectedWords.length > 1) {
        const parts = result.split(separator);
        const resultParts = [];
        let numbersAdded = 0;
        
        for (let i = 0; i < parts.length; i++) {
          resultParts.push(parts[i]);
          
          if (i < parts.length - 1 && numbersAdded < minNumberCount) {
            const spaceAvailable = targetLength - result.length - (minNumberCount - numbersAdded);
            if (spaceAvailable >= separator.length + 1) {
              const randomNum = Math.floor(Math.random() * 10);
              resultParts.push(randomNum.toString());
              numbersAdded++;
            }
          }
        }
        
        result = resultParts.join(separator);
      }
      
      // Check if this is closer to target length
      const difference = Math.abs(result.length - targetLength);
      if (difference < bestDifference) {
        bestResult = result;
        bestDifference = difference;
        
        // If we hit the exact target or very close, use it
        if (difference <= 1) break;
      }
    }
    
    return bestResult;
  };

  const generatePassphrase = () => {
    let result;
    
    if (passphraseOptions.lengthType === 'word-count') {
      result = generatePassphraseByWordCount();
    } else {
      result = generatePassphraseByLength();
    }
    
    setPassword(result);
  };

  const copyToClipboard = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy password:', err);
      }
    }
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handlePassphraseOptionChange = (option, value) => {
    setPassphraseOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleCustomSymbolsChange = (e) => {
    const value = e.target.value;
    const uniqueSymbols = [...new Set(value)].join('');
    setCustomSymbols(uniqueSymbols);
  };

  const handleCustomSeparatorChange = (e) => {
    const value = e.target.value;
    const limitedValue = value.slice(0, 3);
    handlePassphraseOptionChange('customSeparator', limitedValue);
  };

  const clearCustomSymbols = () => {
    setCustomSymbols('');
  };

  const clearCustomSeparator = () => {
    handlePassphraseOptionChange('customSeparator', '');
  };

  const handleGenerate = () => {
    if (generationType === 'password') {
      generatePassword();
    } else {
      generatePassphrase();
    }
  };

  const getMaxMinNumbers = () => {
    const maxPossible = Math.max(1, passphraseOptions.wordCount - 1);
    return Math.min(maxPossible, 5);
  };

  const getTargetLengthAccuracy = () => {
    if (generationType !== 'passphrase' || passphraseOptions.lengthType !== 'character-length' || !password) {
      return null;
    }
    
    const difference = Math.abs(password.length - passphraseOptions.targetLength);
    const accuracy = Math.max(0, 100 - (difference * 10));
    return { difference, accuracy };
  };

  useEffect(() => {
    handleGenerate();
  }, [length, options, customSymbols, generationType, passphraseOptions]);

  const targetAccuracy = getTargetLengthAccuracy();

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        {/* Generation Type Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setGenerationType('password')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                  generationType === 'password'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiKey className="w-4 h-4" />
                <span>Password</span>
              </button>
              <button
                onClick={() => setGenerationType('passphrase')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                  generationType === 'passphrase'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiType className="w-4 h-4" />
                <span>Passphrase</span>
              </button>
            </div>
          </div>
        </div>

        {/* Password Display */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  className="w-full bg-transparent text-lg font-mono text-gray-800 focus:outline-none"
                  placeholder={`Generated ${generationType} will appear here`}
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {copied ? (
                    <FiCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <FiCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Password Options */}
        {generationType === 'password' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FiLock className="w-4 h-4 mr-2" />
                  Password Length
                </label>
                <span className="text-lg font-semibold text-indigo-600">{length}</span>
              </div>
              <input
                type="range"
                min="4"
                max="50"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4</span>
                <span>50</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Character Options
              </h3>
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={() => handleOptionChange('uppercase')}
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Uppercase Letters (A-Z)
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={() => handleOptionChange('lowercase')}
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Lowercase Letters (a-z)
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.numbers}
                    onChange={() => handleOptionChange('numbers')}
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Numbers (0-9)
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.symbols}
                    onChange={() => handleOptionChange('symbols')}
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Default Symbols (!@#$%^&*...)
                  </span>
                </label>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.customSymbols}
                        onChange={() => handleOptionChange('customSymbols')}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Custom Symbols
                      </span>
                    </label>
                    <button
                      onClick={() => setShowCustomSymbolInput(!showCustomSymbolInput)}
                      className="text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      {showCustomSymbolInput ? (
                        <FiX className="w-4 h-4" />
                      ) : (
                        <FiPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {showCustomSymbolInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={customSymbols}
                          onChange={handleCustomSymbolsChange}
                          placeholder="Enter custom symbols..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                        <button
                          onClick={clearCustomSymbols}
                          className="px-3 py-2 text-gray-500 hover:text-red-500 transition-colors"
                          title="Clear custom symbols"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>

                      {customSymbols && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700 mb-1">Custom symbols:</p>
                          <p className="text-sm font-mono text-blue-800 break-all">
                            {customSymbols}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Passphrase Options */}
        {generationType === 'passphrase' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Length Control
              </label>
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  onClick={() => handlePassphraseOptionChange('lengthType', 'word-count')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 ${
                    passphraseOptions.lengthType === 'word-count'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Word Count
                </button>
                <button
                  onClick={() => handlePassphraseOptionChange('lengthType', 'character-length')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 ${
                    passphraseOptions.lengthType === 'character-length'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Character Length
                </button>
              </div>
            </div>

            {passphraseOptions.lengthType === 'word-count' ? (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FiType className="w-4 h-4 mr-2" />
                    Number of Words
                  </label>
                  <span className="text-lg font-semibold text-indigo-600">{passphraseOptions.wordCount}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={passphraseOptions.wordCount}
                  onChange={(e) => handlePassphraseOptionChange('wordCount', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>8</span>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FiLock className="w-4 h-4 mr-2" />
                    Target Length
                  </label>
                  <span className="text-lg font-semibold text-indigo-600">{passphraseOptions.targetLength}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  value={passphraseOptions.targetLength}
                  onChange={(e) => handlePassphraseOptionChange('targetLength', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15</span>
                  <span>60</span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Word Separator
                </label>
                <button
                  onClick={() => setShowCustomSeparatorInput(!showCustomSeparatorInput)}
                  className="text-indigo-600 hover:text-indigo-700 transition-colors flex items-center space-x-1"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span className="text-sm">Custom</span>
                </button>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {['-', '_', '.', ' ', 'custom'].map((sep) => (
                  <button
                    key={sep}
                    onClick={() => handlePassphraseOptionChange('separator', sep)}
                    className={`px-3 py-2 rounded-lg border text-sm font-mono transition-colors ${
                      passphraseOptions.separator === sep
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {sep === ' ' ? 'Space' : sep === 'custom' ? 'Custom' : sep}
                  </button>
                ))}
              </div>

              {(showCustomSeparatorInput || passphraseOptions.separator === 'custom') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={passphraseOptions.customSeparator}
                      onChange={handleCustomSeparatorChange}
                      placeholder="Enter custom separator (max 3 chars)..."
                      maxLength={3}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                    />
                    <button
                      onClick={clearCustomSeparator}
                      className="px-3 py-2 text-gray-500 hover:text-red-500 transition-colors"
                      title="Clear custom separator"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>

                  {passphraseOptions.customSeparator && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 mb-1">Custom separator:</p>
                      <p className="text-sm font-mono text-blue-800">
                        "{passphraseOptions.customSeparator}"
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={passphraseOptions.includeNumbers}
                  onChange={(e) => handlePassphraseOptionChange('includeNumbers', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Include Numbers (mixed between words)
                </span>
              </label>

              {passphraseOptions.includeNumbers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-7 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Minimum Numbers
                    </label>
                    <span className="text-lg font-semibold text-indigo-600">{passphraseOptions.minNumberCount}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={getMaxMinNumbers()}
                    value={passphraseOptions.minNumberCount}
                    onChange={(e) => handlePassphraseOptionChange('minNumberCount', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>{getMaxMinNumbers()}</span>
                  </div>
                </motion.div>
              )}

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={passphraseOptions.capitalize}
                  onChange={(e) => handlePassphraseOptionChange('capitalize', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Capitalize First Letter
                </span>
              </label>
            </div>

            {password && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Current Length:</span>
                  <span className="font-mono font-medium">{password.length} characters</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Separator:</span>
                  <span className="font-mono font-medium">
                    "{getCurrentSeparator() || 'none'}"
                  </span>
                </div>
                {passphraseOptions.lengthType === 'character-length' && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Target Length:</span>
                      <span className="font-mono font-medium">{passphraseOptions.targetLength} characters</span>
                    </div>
                    {targetAccuracy && (
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Accuracy:</span>
                        <span className={`font-mono font-medium ${
                          targetAccuracy.difference <= 2 ? 'text-green-600' : 
                          targetAccuracy.difference <= 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {targetAccuracy.difference === 0 ? 'Perfect match!' : 
                           `±${targetAccuracy.difference} chars`}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Word Count:</span>
                  <span className="font-mono font-medium">{password.split(getCurrentSeparator()).filter(part => !/^\d+$/.test(part)).length} words</span>
                </div>
                {passphraseOptions.includeNumbers && (
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Numbers:</span>
                    <span className="font-mono font-medium">{password.split(getCurrentSeparator()).filter(part => /^\d+$/.test(part)).length} digits</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        <button
          onClick={handleGenerate}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <FiRefreshCw className="w-5 h-5" />
          <span>Generate New {generationType === 'password' ? 'Password' : 'Passphrase'}</span>
        </button>

        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center"
          >
            <span className="text-green-700 font-medium">
              {generationType === 'password' ? 'Password' : 'Passphrase'} copied to clipboard!
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PasswordGenerator;