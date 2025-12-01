/*!
 * Arabic MathJax Extension - v3.4.0 (Full Translation Enforced)
 * Fixes: Matrices now inherit Arabic translation (1->١) correctly.
 */

MathJax.Hub.Register.StartupHook('HTML-CSS Jax Require', function () {
  MathJax.Hub.Config({
    'HTML-CSS': {
      styles: {
        '.MathJax .mfliph': {
          'display': 'inline-block !important',
          '-moz-transform': 'scaleX(-1)',
          '-webkit-transform': 'scaleX(-1)',
          '-o-transform': 'scaleX(-1)',
          'transform': 'scaleX(-1)',
          '-ms-filter': 'fliph',
          'filter': 'fliph'
        },
        '.MathJax .munflip': {
          'display': 'inline-block !important',
          '-moz-transform': 'scaleX(-1)',
          '-webkit-transform': 'scaleX(-1)',
          '-o-transform': 'scaleX(-1)',
          'transform': 'scaleX(-1)',
          'direction': 'ltr !important'
        },
        '.MathJax .mar': {
          'font-style': 'normal !important'
        }
      }
    }
  });
});

MathJax.Hub.Register.StartupHook('HTML-CSS Jax Ready', function () {
  MathJax.Hub.Register.StartupHook('Arabic TeX Ready', function () {
    var MML = MathJax.ElementJax.mml;

    var makeElementFlippable = function (name) {
      var originalToHTML = MML[name].prototype.toHTML;

      MML[name].Augment({
        toHTML: function () {
          var element = originalToHTML.apply(this, arguments);

          if (this.arabicFlipH) {
            var flipElement = document.createElement('span');
            
            if (this.unflip) {
                flipElement.className = 'munflip';
            } else {
                flipElement.className = 'mfliph';
                if ('ar' === this.arabicFontLang) {
                  flipElement.className += ' mar'; 
                }
            }

            while (element.firstChild) {
              flipElement.appendChild(element.firstChild);
            }
            element.appendChild(flipElement);
          }
          return element;
        }
      });
    };

    // القائمة الكاملة للعناصر القابلة للقلب
    [
      'mfrac', 'mi', 'mn', 'mo', 'mrow', 'ms', 'msqrt', 'msubsup', 'mroot', 'mtext', 
      'mtd' // مهم جداً للمصفوفات
    ].forEach(makeElementFlippable);

    MathJax.Hub.Register.StartupHook('HTML-CSS mtable Ready', function () {
      makeElementFlippable('mtable');
      MathJax.Hub.Startup.signal.Post('Arabic mtable Ready');
    });

    MathJax.Hub.Startup.signal.Post('Arabic Ready');
  });
});

MathJax.Extension.Arabic = {
  version: '3.4.0',
  config: MathJax.Hub.CombineConfig("Arabic", {
    dict: {
      'Zero': ['zero', 'Text', ['0', '\u0635\u0641\u0631']],
      'Radius': ['radius', 'Text', ['r', '\u0646\u0642']],
      'Area': ['Area', 'Text', ['A', '\u0645']]
    },
    identifiersMap: {
      'a': '\u0623', 'b': '\u0628', 'c': '\u062c\u0640', 
      'x': '\u0633', 'y': '\u0635', 'z': '\u0639', 
      'n': '\u0646', 'm': '\u0645', 'k': '\u0643', 
      'r': '\u0631', 't': '\u062a', 'h': '\u0647\u0640', 
      'l': '\u0644', 'd': '\u062f', 'e': '\u0647\u0640',
      'v': '\u0639', 'f': '\u0642', 'g': '\u062c\u0640',
      'sin': '\u062c\u0627', 'cos': '\u062c\u062a\u0627', 'tan': '\u0638\u0627',
      'cot': '\u0638\u062a\u0627', 'sec': '\u0642\u0627', 'csc': '\u0642\u062a\u0627',
      'log': '\u0644\u0648'
    },
    numbersMap: {
      '0': '\u0660', '1': '\u0661', '2': '\u0662', '3': '\u0663', '4': '\u0664',
      '5': '\u0665', '6': '\u0666', '7': '\u0667', '8': '\u0668', '9': '\u0669'
    },
    operatorsMap: {
      ',': '\u060c', ';': '\u061b', 'lim': '\u0646\u0647\u0640\u0640\u0627'
    },
    isArabicPage: (document.documentElement.lang === 'ar')
  }),
  
  TeX: function (english, arabic) {
    return function (name) {
      var TEX = MathJax.InputJax.TeX;
      var tex = ('ar' === this.stack.env.lang) ? arabic : english;
      this.Push(TEX.Parse(tex).mml());
    };
  },
  
  Text: function (english, arabicText) {
     return MathJax.Extension.Arabic.TeX(english, '\\text{' + arabicText + '}');
  }
};

MathJax.Hub.Startup.signal.Post('Arabic TeX Startup');

MathJax.Hub.Register.StartupHook('TeX Jax Ready', function () {
  var TEX = MathJax.InputJax.TeX;
  var texParseMMLToken = TEX.Parse.prototype.mmlToken;
  var dict = MathJax.Hub.config.Arabic.dict;

  var escapeRegExp = function (string) {
      return string.replace(/[\\^$.*+?()[\]{}|]/g,'\\$&');
  };

  var getKeysRegExp = function (map) {
    var keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    return new RegExp(keys.map(escapeRegExp).join('|'), 'gi');
  };

  TEX.Definitions.Add({
    macros: {
      'ar': 'HandleArabic',
      'alwaysar': 'MarkAsArabic',
      'fliph': 'HandleFlipHorizontal',
      'noar': 'HandleNoArabic',
      'textar': 'HandleTextAr',
      'text': 'HandleTextAr'
    }
  });

  TEX.Definitions.Add({
    macros: function () {
      var definitions = {};
      Object.keys(dict).forEach(function (key) {
        definitions[dict[key][0]] = key;
      });
      return definitions;
    }()
  });

  TEX.Parse.Augment(function () {
    var parsers = {};
    Object.keys(dict).forEach(function (key) {
      parsers[key] = MathJax.Extension.Arabic[dict[key][1]].apply(null, dict[key][2]);
    });
    return parsers;
  }());

  // --- إصلاح بيئة المصفوفات (فرض الترجمة) ---
  // هذا الكود يضمن أن المصفوفة ترث اللغة العربية من الأب
  var array = TEX.Stack.Item.array;
  if (array) {
      array.Augment({
        Init: function () {
          // استدعاء الدالة الأصلية
          if (arguments.callee.SUPER) arguments.callee.SUPER.apply(this, arguments);
          // الفكرة هنا: نجبر المصفوفة على نسخ بيئة اللغة من الأب
          this.copyEnv = true; 
        },
        clearEnv: function () {
          // نحفظ اللغة الحالية
          var lang = this.env.lang;
          var noArabic = this.env.noArabic;
          
          if (arguments.callee.SUPER) arguments.callee.SUPER.apply(this, arguments);
          
          // نعيد تطبيق اللغة بعد المسح لضمان استمرار الترجمة داخل الخلايا
          if (lang) this.env.lang = lang;
          if (noArabic) this.env.noArabic = noArabic;
        }
      });
  }

  TEX.Parse.Augment({
    flipHorizontal: function (token) {
      token.arabicFlipH = !token.arabicFlipH;
      return token;
    },
    // دالة تحويل الأرقام (تضمن التحويل 1 -> ١)
    arabicNumber: (function () {
      var englishNumbersRegExp = /[0-9]/g;
      var numbersMap = MathJax.Hub.config.Arabic.numbersMap;
      var replaceNumber = function (m) { return numbersMap[m]; };

      return function (token) {
        if (this.stack.env.noArabic) return this.flipHorizontal(token);
        
        var text = token.data[0].data[0];
        var mapped = text.replace(englishNumbersRegExp, replaceNumber);
        
        // إذا تغير النص (تمت الترجمة)، نحدث الرمز
        if (mapped !== text) {
          token.data[0].data[0] = mapped;
          token.arabicFontLang = 'ar';
        }
        return this.flipHorizontal(token);
      }
    }()),
    arabicIdentifier: (function () {
      var identifiersMap = MathJax.Hub.config.Arabic.identifiersMap;
      var identifiersKeysRegExp = getKeysRegExp(identifiersMap);
      var replaceIdentifier = function (m) { return identifiersMap[m.toLowerCase()]; };

      return function (token) {
        if (this.stack.env.noArabic) return this.flipHorizontal(token);
        var text = token.data[0].data[0];
        if ('chars' === token.data[0].type) {
          var mapped = text.replace(identifiersKeysRegExp, replaceIdentifier);
          if (mapped !== text) {
            token.data[0].data[0] = mapped;
            token.arabicFontLang = 'ar';
          }
        }
        return this.flipHorizontal(token);
      }
    }()),
    arabicOperator: (function () {
      var operatorsMap = MathJax.Hub.config.Arabic.operatorsMap;
      var operatorsKeysRegExp = getKeysRegExp(operatorsMap);
      var replaceOperator = function (m) { return operatorsMap[m]; };
      return function (token) {
        if (this.stack.env.noArabic) return token;
        var text = token.data[0].data[0];
        var mapped = text.replace(operatorsKeysRegExp, replaceOperator);
        if (mapped !== text) {
          token = this.flipHorizontal(token);
          token.arabicFontLang = 'ar';
          token.data[0].data[0] = mapped;
        }
        return token;
      }
    }()),
    _getArgumentMML: function (name) {
      var arg = this.ParseArg(name);
      if (arg.inferred && arg.data.length === 1) arg = arg.data[0];
      else delete arg.inferred;
      return arg;
    },
    mmlToken: function (token) {
      var parsedToken = texParseMMLToken.call(this, token);
      if ('ar' === this.stack.env.lang) {
        this.markArabicToken(parsedToken);
      }
      return parsedToken;
    },
    markArabicToken: function (token) {
      if ('mn' === token.type) return this.arabicNumber(token);
      else if ('mi' === token.type) return this.arabicIdentifier(token);
      else if ('mo' === token.type) return this.arabicOperator(token);
      return token;
    },
    MarkAsArabic: function (name) {
      var originalLang = this.stack.env.lang;
      this.stack.env.lang = 'ar';
      var arg = this._getArgumentMML(name);
      this.stack.env.lang = originalLang;
      this.Push(this.flipHorizontal(arg));
    },
    HandleFlipHorizontal: function (name) {
      var arg = this._getArgumentMML(name);
      this.Push(this.flipHorizontal(arg));
    },
    HandleNoArabic: function (name) {
        var originalNoAr = this.stack.env.noArabic;
        this.stack.env.noArabic = true;
        var arg = this._getArgumentMML(name);
        this.stack.env.noArabic = originalNoAr;
        if ('ar' === this.stack.env.lang) {
             arg.unflip = true;
             arg.arabicFlipH = true; 
        }
        this.Push(arg);
    },
    HandleTextAr: function(name) {
        var textContent = this.GetArgument(name);
        var mtext = MathJax.ElementJax.mml.mtext(textContent);
        if ('ar' === this.stack.env.lang) {
             mtext.unflip = true;
             mtext.arabicFlipH = true;
        }
        this.Push(mtext);
    }
  });

  MathJax.Hub.Startup.signal.Post('Arabic TeX Ready');
});

MathJax.Ajax.loadComplete("[arabic]/arabic.js");
