import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiRefreshCw, FiCheck, FiEye, FiEyeOff, FiLock, FiPlus, FiX, FiType, FiKey, FiEdit3, FiHash, FiShield, FiAlertTriangle, FiClock, FiCpu } from 'react-icons/fi';

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
  const [symbolOptions, setSymbolOptions] = useState({
    useDefault: true,
    useCustom: false
  });
  const [minCounts, setMinCounts] = useState({
    uppercase: 1,
    lowercase: 1,
    numbers: 1,
    symbols: 1,
    customSymbols: 1
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Calculate password entropy and crack time
  const calculateEntropy = (passwordText) => {
    if (!passwordText) return { entropy: 0, crackTime: 0, timeString: 'N/A' };

    let charsetSize = 0;
    
    // Determine character set size
    if (/[a-z]/.test(passwordText)) charsetSize += 26; // lowercase
    if (/[A-Z]/.test(passwordText)) charsetSize += 26; // uppercase
    if (/[0-9]/.test(passwordText)) charsetSize += 10; // numbers
    if (/[^A-Za-z0-9]/.test(passwordText)) {
      // Count unique symbols
      const symbols = passwordText.match(/[^A-Za-z0-9]/g) || [];
      const uniqueSymbols = new Set(symbols).size;
      charsetSize += Math.max(uniqueSymbols, 32); // Assume at least 32 common symbols
    }

    // Calculate entropy in bits
    const entropy = Math.log2(Math.pow(charsetSize, passwordText.length));
    
    // Calculate crack time (assume 1 billion guesses per second)
    const guessesPerSecond = 1e9;
    const totalCombinations = Math.pow(charsetSize, passwordText.length);
    const averageGuesses = totalCombinations / 2; // On average, password found halfway through
    const crackTimeSeconds = averageGuesses / guessesPerSecond;
    
    return {
      entropy: Math.round(entropy * 10) / 10,
      crackTime: crackTimeSeconds,
      timeString: formatCrackTime(crackTimeSeconds),
      charsetSize
    };
  };

  // Format crack time into human-readable string
  const formatCrackTime = (seconds) => {
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
    if (seconds < 31536000000000) return `${Math.round(seconds / 31536000000)} thousand years`;
    if (seconds < 31536000000000000) return `${Math.round(seconds / 31536000000000)} million years`;
    if (seconds < 31536000000000000000) return `${Math.round(seconds / 31536000000000000)} billion years`;
    return `${Math.round(seconds / 31536000000000000000)} trillion years`;
  };

  // Get crack time color based on security level
  const getCrackTimeColor = (seconds) => {
    if (seconds < 86400) return 'text-red-600'; // Less than 1 day
    if (seconds < 31536000) return 'text-orange-600'; // Less than 1 year
    if (seconds < 31536000000) return 'text-yellow-600'; // Less than 1000 years
    if (seconds < 31536000000000000) return 'text-blue-600'; // Less than 1 million years
    return 'text-green-600'; // Very secure
  };

  // Password strength calculation
  const calculatePasswordStrength = (passwordText) => {
    if (!passwordText) return { score: 0, level: 'None', feedback: 'No password generated' };

    let score = 0;
    const checks = {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
      variety: false,
      entropy: false
    };

    // Length check
    if (passwordText.length >= 12) {
      score += 20;
      checks.length = true;
    } else if (passwordText.length >= 8) {
      score += 10;
    }

    // Character type checks
    if (/[A-Z]/.test(passwordText)) {
      score += 15;
      checks.uppercase = true;
    }
    if (/[a-z]/.test(passwordText)) {
      score += 15;
      checks.lowercase = true;
    }
    if (/[0-9]/.test(passwordText)) {
      score += 15;
      checks.numbers = true;
    }
    if (/[^A-Za-z0-9]/.test(passwordText)) {
      score += 15;
      checks.symbols = true;
    }

    // Variety check (at least 3 different character types)
    const typeCount = [checks.uppercase, checks.lowercase, checks.numbers, checks.symbols].filter(Boolean).length;
    if (typeCount >= 3) {
      score += 10;
      checks.variety = true;
    }

    // Entropy check (no repeated patterns)
    const uniqueChars = new Set(passwordText).size;
    const entropyRatio = uniqueChars / passwordText.length;
    if (entropyRatio > 0.6) {
      score += 10;
      checks.entropy = true;
    }

    // Determine strength level
    let level, color, bgColor;
    if (score >= 80) {
      level = 'Very Strong';
      color = 'text-green-700';
      bgColor = 'bg-green-100';
    } else if (score >= 60) {
      level = 'Strong';
      color = 'text-blue-700';
      bgColor = 'bg-blue-100';
    } else if (score >= 40) {
      level = 'Moderate';
      color = 'text-yellow-700';
      bgColor = 'bg-yellow-100';
    } else if (score >= 20) {
      level = 'Weak';
      color = 'text-orange-700';
      bgColor = 'bg-orange-100';
    } else {
      level = 'Very Weak';
      color = 'text-red-700';
      bgColor = 'bg-red-100';
    }

    // Generate feedback
    const feedback = [];
    if (!checks.length) feedback.push('Use at least 12 characters');
    if (!checks.uppercase) feedback.push('Add uppercase letters');
    if (!checks.lowercase) feedback.push('Add lowercase letters');
    if (!checks.numbers) feedback.push('Include numbers');
    if (!checks.symbols) feedback.push('Include symbols');
    if (!checks.variety) feedback.push('Use more character types');
    if (!checks.entropy) feedback.push('Avoid repeated patterns');

    return {
      score: Math.min(100, score),
      level,
      color,
      bgColor,
      feedback: feedback.length > 0 ? feedback : ['Excellent password strength!'],
      checks
    };
  };

  // Function to get character type for styling
  const getCharacterType = (char) => {
    if (/[A-Z]/.test(char)) return 'uppercase';
    if (/[0-9]/.test(char)) return 'number';
    if (defaultSymbols.includes(char)) return 'default-symbol';
    if (customSymbols.includes(char)) return 'custom-symbol';
    return 'lowercase';
  };

  // Function to get color class based on character type
  const getCharacterColor = (type) => {
    switch (type) {
      case 'uppercase': return 'text-blue-600';
      case 'number': return 'text-green-600';
      case 'default-symbol': return 'text-red-600';
      case 'custom-symbol': return 'text-purple-600';
      default: return 'text-gray-800';
    }
  };

  // Function to render colored password
  const renderColoredPassword = (passwordText) => {
    if (!passwordText) return '';
    return passwordText.split('').map((char, index) => {
      const type = getCharacterType(char);
      const colorClass = getCharacterColor(type);
      return (
        <span key={index} className={colorClass}>
          {char}
        </span>
      );
    });
  };

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const defaultSymbolsChars = defaultSymbols;
    const customSymbolsChars = customSymbols;

    // Build character sets and their minimum requirements
    const charSets = [];
    const requiredChars = [];

    if (options.uppercase) {
      charSets.push({ chars: uppercase, min: minCounts.uppercase, type: 'uppercase' });
    }
    if (options.lowercase) {
      charSets.push({ chars: lowercase, min: minCounts.lowercase, type: 'lowercase' });
    }
    if (options.numbers) {
      charSets.push({ chars: numbers, min: minCounts.numbers, type: 'numbers' });
    }

    // Handle symbols based on selection
    if (options.symbols) {
      let symbolChars = '';
      let symbolMin = 0;

      if (symbolOptions.useDefault) {
        symbolChars += defaultSymbolsChars;
        symbolMin += minCounts.symbols;
      }
      if (symbolOptions.useCustom && customSymbolsChars) {
        symbolChars += customSymbolsChars;
        symbolMin += minCounts.customSymbols;
      }

      if (symbolChars) {
        charSets.push({ chars: symbolChars, min: symbolMin, type: 'symbols' });
      }
    }

    if (charSets.length === 0) {
      setPassword('');
      return;
    }

    // Calculate total minimum characters needed
    const totalMinChars = charSets.reduce((sum, set) => sum + set.min, 0);
    if (totalMinChars > length) {
      setPassword('');
      return;
    }

    // Generate required minimum characters for each type
    for (const set of charSets) {
      for (let i = 0; i < set.min; i++) {
        const randomChar = set.chars.charAt(Math.floor(Math.random() * set.chars.length));
        requiredChars.push(randomChar);
      }
    }

    // Fill remaining length with random characters from all available sets
    const allChars = charSets.map(set => set.chars).join('');
    const remainingLength = length - requiredChars.length;
    for (let i = 0; i < remainingLength; i++) {
      const randomChar = allChars.charAt(Math.floor(Math.random() * allChars.length));
      requiredChars.push(randomChar);
    }

    // Shuffle the array to randomize character positions
    for (let i = requiredChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
    }

    setPassword(requiredChars.join(''));
  };

  const getCurrentSeparator = () => {
    return passphraseOptions.separator === 'custom' ? passphraseOptions.customSeparator : passphraseOptions.separator;
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
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleSymbolOptionChange = (option) => {
    setSymbolOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleMinCountChange = (type, value) => {
    setMinCounts(prev => ({ ...prev, [type]: value }));
  };

  const handlePassphraseOptionChange = (option, value) => {
    setPassphraseOptions(prev => ({ ...prev, [option]: value }));
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

  const handleGenerate = async () => {
    setIsRefreshing(true);
    // Add a small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 200));

    if (generationType === 'password') {
      generatePassword();
    } else {
      generatePassphrase();
    }

    setIsRefreshing(false);
  };

  const getMaxMinCount = (type) => {
    const enabledTypes = Object.keys(options).filter(key => {
      if (key === 'symbols') {
        return options[key] && (symbolOptions.useDefault || (symbolOptions.useCustom && customSymbols.length > 0));
      }
      return options[key];
    });

    if (enabledTypes.length === 0) return 1;

    const maxPossible = Math.floor(length / enabledTypes.length);
    return Math.max(1, Math.min(maxPossible, Math.floor(length * 0.8)));
  };

  const getTotalMinCount = () => {
    let total = 0;
    if (options.uppercase) total += minCounts.uppercase;
    if (options.lowercase) total += minCounts.lowercase;
    if (options.numbers) total += minCounts.numbers;
    if (options.symbols) {
      if (symbolOptions.useDefault) total += minCounts.symbols;
      if (symbolOptions.useCustom && customSymbols.length > 0) total += minCounts.customSymbols;
    }
    return total;
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

  // Auto-adjust min counts when length changes
  useEffect(() => {
    const totalMin = getTotalMinCount();
    if (totalMin > length) {
      const enabledTypes = Object.keys(options).filter(key => {
        if (key === 'symbols') {
          return options[key] && (symbolOptions.useDefault || (symbolOptions.useCustom && customSymbols.length > 0));
        }
        return options[key];
      });

      const newMinCount = Math.max(1, Math.floor(length / enabledTypes.length));
      setMinCounts(prev => ({
        ...prev,
        uppercase: options.uppercase ? newMinCount : prev.uppercase,
        lowercase: options.lowercase ? newMinCount : prev.lowercase,
        numbers: options.numbers ? newMinCount : prev.numbers,
        symbols: (options.symbols && symbolOptions.useDefault) ? newMinCount : prev.symbols,
        customSymbols: (options.symbols && symbolOptions.useCustom && customSymbols.length > 0) ? newMinCount : prev.customSymbols
      }));
    }
  }, [length, options, symbolOptions, customSymbols]);

  useEffect(() => {
    handleGenerate();
  }, [length, options, symbolOptions, minCounts, customSymbols, generationType, passphraseOptions]);

  const targetAccuracy = getTargetLengthAccuracy();
  const totalMinCount = getTotalMinCount();
  const isMinCountValid = totalMinCount <= length;
  const strengthInfo = calculatePasswordStrength(password);
  const entropyInfo = calculateEntropy(password);

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
                {showPassword ? (
                  <div className="w-full text-lg font-mono break-all leading-relaxed">
                    {password ? renderColoredPassword(password) : (
                      <span className="text-gray-500">
                        Generated {generationType} will appear here
                      </span>
                    )}
                  </div>
                ) : (
                  <input
                    type="password"
                    value={password}
                    readOnly
                    className="w-full bg-transparent text-lg font-mono text-gray-800 focus:outline-none"
                    placeholder={`Generated ${generationType} will appear here`}
                  />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerate}
                  disabled={isRefreshing}
                  className={`p-2 text-gray-500 hover:text-indigo-600 transition-all duration-200 ${
                    isRefreshing ? 'animate-spin' : 'hover:scale-110'
                  }`}
                  title="Generate new password"
                >
                  <FiRefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
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
                  title="Copy to clipboard"
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

        {/* Password Strength Indicator */}
        {password && (
          <div className="mb-8">
            <div className={`p-4 rounded-lg border ${strengthInfo.bgColor} border-opacity-50`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FiShield className={`w-5 h-5 ${strengthInfo.color}`} />
                  <span className="text-sm font-medium text-gray-700">Password Strength</span>
                </div>
                <span className={`text-sm font-bold ${strengthInfo.color}`}>
                  {strengthInfo.level}
                </span>
              </div>
              
              {/* Strength Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    strengthInfo.score >= 80 ? 'bg-green-500' :
                    strengthInfo.score >= 60 ? 'bg-blue-500' :
                    strengthInfo.score >= 40 ? 'bg-yellow-500' :
                    strengthInfo.score >= 20 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${strengthInfo.score}%` }}
                ></div>
              </div>

              {/* Entropy and Crack Time Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiCpu className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-700">Entropy</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {entropyInfo.entropy} bits
                  </div>
                  <div className="text-xs text-gray-600">
                    {entropyInfo.charsetSize} character set
                  </div>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiClock className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-gray-700">Time to Crack</span>
                  </div>
                  <div className={`text-lg font-bold ${getCrackTimeColor(entropyInfo.crackTime)}`}>
                    {entropyInfo.timeString}
                  </div>
                  <div className="text-xs text-gray-600">
                    @ 1B guesses/sec
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {strengthInfo.feedback.length > 0 && (
                <div className="space-y-1">
                  {strengthInfo.feedback.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {item === 'Excellent password strength!' ? (
                        <FiCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <FiAlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="text-xs text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Color Legend for Passwords */}
        {generationType === 'password' && password && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Character Color Guide</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-mono font-bold">A</span>
                <span className="text-gray-600">Uppercase</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-800 font-mono font-bold">a</span>
                <span className="text-gray-600">Lowercase</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-mono font-bold">1</span>
                <span className="text-gray-600">Numbers</span>
              </div>
              {symbolOptions.useDefault && (
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 font-mono font-bold">!</span>
                  <span className="text-gray-600">Default Symbols</span>
                </div>
              )}
              {symbolOptions.useCustom && customSymbols && (
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600 font-mono font-bold">{customSymbols.charAt(0)}</span>
                  <span className="text-gray-600">Custom Symbols</span>
                </div>
              )}
            </div>
          </div>
        )}

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

            {/* Min Count Warning */}
            {!isMinCountValid && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FiX className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      Minimum count too high
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Total minimum characters ({totalMinCount}) exceeds password length ({length})
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Character Options
              </h3>
              <div className="space-y-6">
                {/* Uppercase */}
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.uppercase}
                      onChange={() => handleOptionChange('uppercase')}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Uppercase Letters (A-Z) <span className="text-blue-600 font-mono">ABC</span>
                    </span>
                  </label>
                  {options.uppercase && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-7 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-600 flex items-center">
                          <FiHash className="w-3 h-3 mr-1" />
                          Minimum Count
                        </label>
                        <span className="text-sm font-semibold text-indigo-600">{minCounts.uppercase}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={getMaxMinCount('uppercase')}
                        value={minCounts.uppercase}
                        onChange={(e) => handleMinCountChange('uppercase', parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>1</span>
                        <span>{getMaxMinCount('uppercase')}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Lowercase */}
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.lowercase}
                      onChange={() => handleOptionChange('lowercase')}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Lowercase Letters (a-z) <span className="text-gray-800 font-mono">abc</span>
                    </span>
                  </label>
                  {options.lowercase && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-7 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-600 flex items-center">
                          <FiHash className="w-3 h-3 mr-1" />
                          Minimum Count
                        </label>
                        <span className="text-sm font-semibold text-indigo-600">{minCounts.lowercase}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={getMaxMinCount('lowercase')}
                        value={minCounts.lowercase}
                        onChange={(e) => handleMinCountChange('lowercase', parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>1</span>
                        <span>{getMaxMinCount('lowercase')}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Numbers */}
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.numbers}
                      onChange={() => handleOptionChange('numbers')}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Numbers (0-9) <span className="text-green-600 font-mono">123</span>
                    </span>
                  </label>
                  {options.numbers && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-7 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-600 flex items-center">
                          <FiHash className="w-3 h-3 mr-1" />
                          Minimum Count
                        </label>
                        <span className="text-sm font-semibold text-indigo-600">{minCounts.numbers}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={getMaxMinCount('numbers')}
                        value={minCounts.numbers}
                        onChange={(e) => handleMinCountChange('numbers', parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>1</span>
                        <span>{getMaxMinCount('numbers')}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Symbols Section */}
                <div className="space-y-3 border-t pt-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.symbols}
                      onChange={() => handleOptionChange('symbols')}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Include Symbols
                    </span>
                  </label>
                  {options.symbols && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-7 space-y-4"
                    >
                      {/* Symbol Type Selection */}
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Symbol Types</h4>
                        
                        {/* Default Symbols */}
                        <div className="space-y-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={symbolOptions.useDefault}
                              onChange={() => handleSymbolOptionChange('useDefault')}
                              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm text-gray-700">
                              Default Symbols (!@#$%^&*...) <span className="text-red-600 font-mono">!@#</span>
                            </span>
                          </label>
                          {symbolOptions.useDefault && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-7 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-600 flex items-center">
                                  <FiHash className="w-3 h-3 mr-1" />
                                  Minimum Count
                                </label>
                                <span className="text-sm font-semibold text-indigo-600">{minCounts.symbols}</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max={getMaxMinCount('symbols')}
                                value={minCounts.symbols}
                                onChange={(e) => handleMinCountChange('symbols', parseInt(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>1</span>
                                <span>{getMaxMinCount('symbols')}</span>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Custom Symbols */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={symbolOptions.useCustom}
                                onChange={() => handleSymbolOptionChange('useCustom')}
                                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                              />
                              <span className="ml-3 text-sm text-gray-700">
                                Custom Symbols {customSymbols && <span className="text-purple-600 font-mono">{customSymbols.slice(0, 3)}</span>}
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
                          
                          {/* Custom Symbols Minimum Count */}
                          {symbolOptions.useCustom && customSymbols.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-7 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-600 flex items-center">
                                  <FiHash className="w-3 h-3 mr-1" />
                                  Minimum Count
                                </label>
                                <span className="text-sm font-semibold text-indigo-600">{minCounts.customSymbols}</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max={getMaxMinCount('customSymbols')}
                                value={minCounts.customSymbols}
                                onChange={(e) => handleMinCountChange('customSymbols', parseInt(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>1</span>
                                <span>{getMaxMinCount('customSymbols')}</span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Character Count Summary */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Character Requirements</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Length:</span>
                  <span className="font-mono font-medium">{length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Required:</span>
                  <span className={`font-mono font-medium ${!isMinCountValid ? 'text-red-500' : 'text-green-600'}`}>
                    {totalMinCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-mono font-medium">{Math.max(0, length - totalMinCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Random Fill:</span>
                  <span className="font-mono font-medium">{Math.max(0, length - totalMinCount)}</span>
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
                          {targetAccuracy.difference === 0 ? 'Perfect match!' : `±${targetAccuracy.difference} chars`}
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
          disabled={isRefreshing || !isMinCountValid}
          className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
            isRefreshing || !isMinCountValid ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
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