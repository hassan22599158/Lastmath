/*!
 * Arabic MathJax Extension - Original Core + Text Fixes
 * Based on the original v1.0.0 by Queen Rania Foundation
 * Fixed: Text mirroring & Matrix cell orientation.
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
        /* كلاس جديد لإصلاح النصوص: يعيد قلب العنصر ليظهر بشكل طبيعي */
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
        },
        '.MathJax .mar > span': {
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

            // التعديل: إذا كان العنصر يحمل خاصية unflip، نستخدم كلاس التصحيح
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

    [
      'mfrac',
      'mi',
      'mn',
      'mo',
      'mrow',
      'ms',
      'msqrt',
      'msubsup',
      'mroot',
      'mtext',
      'mtd' // إضافة mtd هنا ضرورية جداً لكي تظهر أرقام المصفوفات معتدلة
    ].forEach(makeElementFlippable);

    MathJax.Hub.Register.StartupHook('HTML-CSS mtable Ready', function () {
      makeElementFlippable('mtable');
      MathJax.Hub.Startup.signal.Post('Arabic mtable Ready');
    });


    MathJax.Hub.Startup.signal.Post('Arabic Ready');
  });
});

MathJax.Extension.Arabic = {
  version: '1.2.0-Fixed', // تحديث رقم الإصدار
  config: MathJax.Hub.CombineConfig("Arabic", {
    dict: {
      'Zero': ['zero', 'Text', ['0', '\u0635\u0641\u0631']],
      'Radius': ['radius', 'Text', ['r', '\u0646\u0642']],
      'Area': ['Area', 'Text', ['A', '\u0645']]
    },
    identifiersMap: {
      'a': '\u0623',
      'b': '\u0628',
      'c': '\u062c\u0640',
      'x': '\u0633',
      'y': '\u0635',
      'z': '\u0639',
      'n': '\u0646',
      'f': '\u0642',
      'g': '\u062c\u0640',
      'h': '\u0647\u0640',
      'k': '\u0643',
      'r': '\u0631',
      't': '\u062a',
      'd': '\u062f',
      'e': '\u0647\u0640',
      'm': '\u0645',
      'l': '\u0644',
      'v': '\u0639', // Velocity extension

      'sin': '\u062c\u0627',
      'cos': '\u062c\u062a\u0627',
      'tan': '\u0638\u0627',
      'cot': '\u0638\u062a\u0627',
      'sec': '\u0642\u0627',
      'csc': '\u0642\u062a\u0627',
      'log': '\u0644\u0648'
    },
    numbersMap: {
      '0': '\u0660', '1': '\u0661', '2': '\u0662', '3': '\u0663', '4': '\u0664',
      '5': '\u0665', '6': '\u0666', '7': '\u0667', '8': '\u0668', '9': '\u0669'
    },
    operatorsMap: {
      ',': '\u060c',
      ';': '\u061b',
      'lim': '\u0646\u0647\u0640\u0640\u0627'
    },
    isArabicPage: (document.documentElement.lang === 'ar')
  }),
  arabicLanguageRegExp: /([\u0600-\u06FF]+)/g,
  TeX: function (english, arabic) {
    return function (name) {
      var TEX = MathJax.InputJax.TeX;
      var tex;
      if ('ar' === this.stack.env.lang) {
        tex = arabic;
      } else {
        tex = english;
      }
      this.Push(TEX.Parse(tex).mml());
    };
  },
  Text: function (english, arabicText) {
    // التعديل هنا: استخدام munflip بدلاً من fliph للنصوص الصريحة
    return MathJax.Extension.Arabic.TeX(english, '\\unflip{\\text{' + arabicText + '}}');
  },
  Symbols: function (english, arabicSymbols) {
    // التعديل هنا: استخدام unflip للرموز النصية أيضاً
    var arabic = arabicSymbols.replace(
      MathJax.Extension.Arabic.arabicLanguageRegExp,
      '\\unflip{\\text{$1}}'
    );
    return MathJax.Extension.Arabic.TeX(english, arabic);
  }
};


MathJax.Hub.Startup.signal.Post('Arabic TeX Startup');


MathJax.Hub.Register.StartupHook('TeX Jax Ready', function () {
  var TEX = MathJax.InputJax.TeX;
  var Arabic = MathJax.Extension.Arabic;

  var texParseMMLToken = TEX.Parse.prototype.mmlToken;
  var dict = MathJax.Hub.config.Arabic.dict;

  var escapeRegExp = (function () {
    var regExpChar = /[\\^$.*+?()[\]{}|]/g;
    return function (string) {
      return string.replace(regExpChar,'\\$&');
    };
  }());

  var getKeysRegExp = function (map) {
    var keys = Object.keys(map).sort(function (a, b) {
      return b.length - a.length;
    });
    return new RegExp(keys.map(escapeRegExp).join('|'), 'gi');
  };


  TEX.Definitions.Add({
    macros: {
      'ar': 'HandleArabic',
      'alwaysar': 'MarkAsArabic',
      'fliph': 'HandleFlipHorizontal',
      'unflip': 'HandleUnFlipHorizontal', // الماكرو الجديد للإصلاح
      'noar': 'HandleNoArabic',          // ماكرو الاستثناء
      'transx': 'TranslateTeX',
      'transt': 'TranslateText',
      'transs': 'TranslateSymbols',
      'text': 'HandleTextAr'             // تحويل الأمر text للأمر الذكي
    }
  });

  var array = TEX.Stack.Item.array;
  var arrayClearEnv = array.prototype.clearEnv;
  var arrayInit = array.prototype.Init;

  // هذا الكود الأصلي الذي يضمن عمل المصفوفات بشكل صحيح
  // لم نعدل عليه شيئاً لضمان عدم حدوث Error
  array.Augment({
    Init: function () {
      arrayInit.apply(this, arguments);
      this.copyEnv = true;
    },
    clearEnv: function () {
      var lang = this.env.lang;
      arrayClearEnv.apply(this, arguments);
      if (lang) {
        this.env.lang = lang;
      }
    }
  });

  TEX.Definitions.Add({
    macros: function () {
      var definitions = {};
      Object.keys(dict).forEach(function (key) {
        var texCommand = dict[key][0];
        definitions[texCommand] = key;
      });
      return definitions;
    }()
  });


  TEX.Parse.Augment(function () {
    var parsers = {};
    Object.keys(dict).forEach(function (key) {
      var helperName = dict[key][1];
      var helperParams = dict[key][2];
      parsers[key] = Arabic[helperName].apply(null, helperParams);
    });
    return parsers;
  }());


  TEX.Parse.Augment({
    flipHorizontal: function (token) {
      token.arabicFlipH = !token.arabicFlipH;
      return token;
    },
    arabicNumber: (function () {
      var englishNumbersRegExp = /[0-9]/g;
      var numbersMap = MathJax.Hub.config.Arabic.numbersMap;
      var replaceNumber = function (m) { return numbersMap[m]; };

      return function (token) {
        // حماية الاستثناء: إذا كنا في noArabic لا نترجم
        if (this.stack.env.noArabic) return this.flipHorizontal(token);

        var text = token.data[0].data[0];
        var mapped = text.replace(englishNumbersRegExp, replaceNumber);
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
        // حماية الاستثناء
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
        // حماية الاستثناء
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
      if (arg.inferred && arg.data.length === 1) {
        arg = arg.data[0];
      } else {
        delete arg.inferred;
      }
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
    HandleArabic: function (name) {
      if (MathJax.Hub.config.Arabic.isArabicPage) {
        this.MarkAsArabic(name);
      }
    },
    TranslateTeX: function (name) {
      var english = this.GetArgument(name);
      var arabicText = this.GetArgument(name);
      var helper = Arabic.TeX(english, arabicText);
      return helper.call(this, name);
    },
    TranslateText: function (name) {
      var english = this.GetArgument(name);
      var arabicText = this.GetArgument(name);
      var helper = Arabic.Text(english, arabicText);
      return helper.call(this, name);
    },
    TranslateSymbols: function (name) {
      var english = this.GetArgument(name);
      var arabicText = this.GetArgument(name);
      var helper = Arabic.Symbols(english, arabicText);
      return helper.call(this, name);
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
    // --- الدوال المضافة للإصلاح ---
    HandleUnFlipHorizontal: function (name) {
       var arg = this._getArgumentMML(name);
       arg.unflip = true;
       arg.arabicFlipH = true;
       this.Push(arg);
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
