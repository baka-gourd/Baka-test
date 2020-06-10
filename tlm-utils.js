'use strict';

var path = require('path');

/**
 * 递归创建文件夹
 * @param {String} dirname 文件夹
 */
function mkdirs(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirs(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

/**
 * 检查字符串对象是否为空
 * @param {String} str 字符串
 */
function isEmpty(str) {
    return typeof str == "undefined" || str == null || str.trim() === "";
}

var TLM_PROJECT_INFO = {
    type: "maid",       // 只有两个选项：maid, chair
    namespace: "",
    namespace_path: "",
    textures_path: "",
    animation_path: "",
    lang_path: "",
    models_path: "",
    model_id: "",
    texture_name: "",
    version: "",
    pack_data: {}
};

function clearAll() {
    TLM_PROJECT_INFO = {
        type: "maid",       // 只有两个选项：maid, chair
        namespace: "",
        namespace_path: "",
        textures_path: "",
        animation_path: "",
        lang_path: "",
        models_path: "",
        model_id: "",
        texture_name: "",
        version: "",
        pack_data: {}
    };
}

var createNewPack = new Action('create_new_pack', {
    name: '创建资源包',
    description: '创建一个新的资源包文件夹',
    icon: 'create',
    click: function () {
        createNewPackDialog.show();
    }
});

var createNewPackDialog = new Dialog({
    id: "create_new_pack",
    title: "请输入资源包相关参数",
    form: {
        packId: {
            label: "资源包 ID（必填）",
            type: "input",
            placeholder: "书写的字符和长度有一定要求"
        },
        line1: "_",
        packVersion: {
            label: "资源包版本（可选）",
            type: "input",
            placeholder: "格式推荐 1.0.0"
        },
        packIcon: {
            label: "资源包图标（可选）",
            type: "file",
            extensions: ['png'],
            filetype: 'PNG'
        }
    },
    onConfirm: function (formData) {
        // 将 ID 中的大写字符全部变成小写字符
        // 空格和 - 字符转换为下划线
        let packId = formData.packId.toLowerCase().replace(/\s|-/g, '_');

        // 必填数据的格式判定
        // ID 字符校验
        if (!(/^[\w.]+$/.test(packId))) {
            Blockbench.notification("资源包 ID 不合法！", "资源包 ID 仅支持英文字母，下划线和英文点号！");
            return;
        }
        // ID 长度校验
        if (packId.length < 6) {
            Blockbench.notification('资源包 ID 过短！', "为避免冲突，资源包 ID 至少应为 6 个字符！");
            return;
        }

        // 数据存储
        TLM_PROJECT_INFO["namespace"] = packId;

        // 包版本信息，如果没有，默认安置一个 1.0.0
        let packVersion;
        if (isEmpty(formData.packVersion)) {
            packVersion = "1.0.0";
        } else {
            // TODO: 不按要求书写的提醒？纠正？
            packVersion = formData.packVersion;
        }
        // 数据存储
        TLM_PROJECT_INFO["version"] = packVersion;

        // 选择放置资源包文件夹的窗口
        ElecDialogs.showOpenDialog(currentwindow, {
            properties: ['openDirectory']
        }, function (path) {
            // 取消选择时，path 为空
            if (path === undefined || path === null) {
                return;
            }

            // 创建资源包根目录
            let root = `${path}/${packId}-${packVersion}`;
            mkdirs(root);

            // 创建命名空间文件夹            
            let namespace = `${root}/assets/${packId}`;
            mkdirs(namespace);
            // 存储数据
            TLM_PROJECT_INFO["namespace_path"] = namespace;

            // 自定义动画脚本文件夹
            mkdirs(`${namespace}/animation`);
            TLM_PROJECT_INFO["animation_path"] = `${namespace}/animation`;

            // 语言文件夹
            mkdirs(`${namespace}/lang`);
            TLM_PROJECT_INFO["lang_path"] = `${namespace}/lang`;

            // 模型文件夹
            let packModels = `${namespace}/models/entity`;
            mkdirs(packModels);
            // 存储数据
            TLM_PROJECT_INFO["models_path"] = packModels;

            // 材质文件夹
            let packTextures = `${namespace}/textures/entity`;
            mkdirs(packTextures);
            TLM_PROJECT_INFO["textures_path"] = packTextures;

            // 创建 pack.mcmeta 文件
            let DEFAULT_TLM_PACK_DESC = '{"pack":{"pack_format":3,"description":"Touhou Little Maid Resources Pack"}}';
            fs.writeFileSync(`${root}/pack.mcmeta`, DEFAULT_TLM_PACK_DESC);

            // 如果图标不为空，复制图标
            if (!isEmpty(formData.packIcon)) {
                fs.writeFileSync(`${root}/pack.png`, fs.readFileSync(formData.packIcon));
            }

            createNewPackDialog.hide();
            Blockbench.notification("资源包创建成功！", `已经在 ${path} 放置对应资源包`);
        });
    }
});

/**
 * 格式化日期类
 * 来源：https://www.runoob.com/js/js-obj-date.html
 * @param {Date} date 日期
 * @param {String} fmt 格式符
 */
function dateFormat(date, fmt = "yyyy-MM-dd") {
    let o = {
        "M+": date.getMonth() + 1,                           // 月份
        "d+": date.getDate(),                               // 日
        "h+": date.getHours(),                              // 小时
        "m+": date.getMinutes(),                           // 分
        "s+": date.getSeconds(),                           // 秒
        "q+": Math.floor((date.getMonth() + 3) / 3),   // 季度
        "S": date.getMilliseconds()                       // 毫秒
    };

    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }

    return fmt;
}

var english = {};

function addLanguageEntry(key, value) {
    english[key] = value;
}

function saveLanguageFile() {
    let output = "";
    for (let k in english) {
        output = output + `${k}=${english[k]}\n`;
    }
    fs.writeFileSync(`${TLM_PROJECT_INFO["lang_path"]}/en_us.lang`, output);
}

function reloadAndReadLanguage() {
    let englishFile = `${TLM_PROJECT_INFO["lang_path"]}/en_us.lang`;
    english = {};
    if (fs.existsSync(englishFile) && fs.statSync(englishFile).isFile()) {
        let allText = fs.readFileSync(englishFile, 'utf8');
        allText.split(/\r?\n/).forEach(function (line) {
            // 排除 # 开头的注释
            if (line.indexOf("#") !== 0) {
                let text = line.split("=", 2);
                if (!isEmpty(text[0]) && !isEmpty(text[1])) {
                    english[text[0]] = text[1];
                }
            }
        });
    }
}

/**
 * 检查当前模型 id 是否和已经存储的模型有同名冲突？
 * 如果确实冲突，返回 true
 */
function checkDuplicateModelId() {
    let namespace = TLM_PROJECT_INFO["namespace"];
    let modelId = TLM_PROJECT_INFO["model_id"];
    let modelList = TLM_PROJECT_INFO["pack_data"]["model_list"];
    if (isEmpty(modelId)) {
        return false;
    }
    if (modelList === undefined || modelList === null || modelList.length === 0) {
        return false;
    }
    for (let i in modelList) {
        if (modelList[i]["model_id"] === `${namespace}:${modelId}`) {
            return true;
        }
    }
    return false;
}

function addModelToList(modelData) {
    let namespace = TLM_PROJECT_INFO["namespace"];
    let modelId = TLM_PROJECT_INFO["model_id"];
    let modelList = TLM_PROJECT_INFO["pack_data"]["model_list"];
    if (isEmpty(modelId)) {
        return;
    }
    if (modelList === undefined || modelList === null || modelList.length === 0) {
        TLM_PROJECT_INFO.pack_data.model_list = [modelData];
        return;
    }
    for (let i in modelList) {
        if (modelList[i]["model_id"] === `${namespace}:${modelId}`) {
            modelList[i] = modelData;
            return;
        }
    }
    modelList.push(modelData);
}

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var crypt = createCommonjsModule(function (module) {
(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();
});

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

var charenc_1 = charenc;

var sha1 = createCommonjsModule(function (module) {
(function() {
  var crypt$1 = crypt,
      utf8 = charenc_1.utf8,
      bin = charenc_1.bin,

  // The core
  sha1 = function (message) {
    // Convert to byte array
    if (message.constructor == String)
      message = utf8.stringToBytes(message);
    else if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer == 'function' && Buffer.isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message))
      message = message.toString();

    // otherwise assume byte array

    var m  = crypt$1.bytesToWords(message),
        l  = message.length * 8,
        w  = [],
        H0 =  1732584193,
        H1 = -271733879,
        H2 = -1732584194,
        H3 =  271733878,
        H4 = -1009589776;

    // Padding
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >>> 9) << 4) + 15] = l;

    for (var i = 0; i < m.length; i += 16) {
      var a = H0,
          b = H1,
          c = H2,
          d = H3,
          e = H4;

      for (var j = 0; j < 80; j++) {

        if (j < 16)
          w[j] = m[i + j];
        else {
          var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
          w[j] = (n << 1) | (n >>> 31);
        }

        var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                         (H1 ^ H2 ^ H3) - 899497514);

        H4 = H3;
        H3 = H2;
        H2 = (H1 << 30) | (H1 >>> 2);
        H1 = H0;
        H0 = t;
      }

      H0 += a;
      H1 += b;
      H2 += c;
      H3 += d;
      H4 += e;
    }

    return [H0, H1, H2, H3, H4];
  },

  // Public API
  api = function (message, options) {
    var digestbytes = crypt$1.wordsToBytes(sha1(message));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt$1.bytesToHex(digestbytes);
  };

  api._blocksize = 16;
  api._digestsize = 20;

  module.exports = api;
})();
});

var saveNewMaidModelDialog = new Dialog({
    id: "save_new_maid_model_dialog",
    title: "请输入模型相关参数",
    form: {
        modelId: {
            label: "模型 ID（必填）",
            type: "input",
            placeholder: "仅支持小写英文字符和 . 和 _"
        },
        modelName: {
            label: "模型名称（必填）",
            type: "input",
            placeholder: "建议使用英文描述"
        },
        line1: "_",
        modelDesc: {
            label: "模型描述（可选）",
            type: "input",
            placeholder: "留空表示不填写任何描述"
        },
        renderItemScale: {
            label: "渲染成物品时的大小",
            type: "number",
            value: 1.0,
            min: 0.1,
            max: 2,
            step: 0.05
        },
        renderEntityScale: {
            label: "渲染成实体时的大小",
            type: "number",
            value: 1.0,
            min: 0.7,
            max: 1.3,
            step: 0.05
        },
        showHata: {
            label: "显示旗指物",
            type: "checkbox",
            value: true
        },
        showBackpack: {
            label: "显示背包",
            type: "checkbox",
            value: true
        },
        canHoldTrolley: {
            label: "持有拉杆箱",
            type: "checkbox",
            value: true
        },
        canHoldVehicle: {
            label: "持有载具",
            type: "checkbox",
            value: true
        },
        canRidingBroom: {
            label: "骑乘扫帚",
            type: "checkbox",
            value: true
        },
        showCustomHead: {
            label: "显示头颅",
            type: "checkbox",
            value: true
        },
        egg: {
            label: "彩蛋（可选）",
            type: "input",
            placeholder: "留空表示不设置彩蛋"
        },
        encryption: {
            label: "彩蛋是否加密",
            type: "checkbox",
            value: false
        },
        animation: {
            label: "动画脚本（可选）",
            type: "file",
            extensions: ['blockbench'],
            filetype: 'JS'
        },
    },
    onConfirm: function (formData) {
        // 数据获取
        let namespace = TLM_PROJECT_INFO["namespace"];

        // 模型数据
        let modelData = {};
        let languageMap = {};

        // 将 ID 中的大写字符全部变成小写字符
        // 空格和 - 字符转换为下划线
        let modelId = formData.modelId.toLowerCase().replace(/\s|-/g, '_');

        // 必填数据的格式判定
        // ID 字符校验
        if (!(/^[\w.]+$/.test(modelId))) {
            Blockbench.notification("模型 ID 不合法！", "模型 ID 仅支持英文字母，下划线和英文点号！");
            return;
        } else {
            saveNewMaidModelDialog.form.modelId.value = formData.modelId;
        }

        // 存储 id 数据
        TLM_PROJECT_INFO["model_id"] = modelId;
        TLM_PROJECT_INFO["texture_name"] = `${modelId}.png`;
        // 存入模型数据
        modelData["model_id"] = `${namespace}:${modelId}`;

        // 模型名不能为空
        if (isEmpty(formData.modelName)) {
            Blockbench.notification("模型名称不能为空", "请输入一个可辨识的英文模型名称！");
            return;
        } else {
            // 往语言文件里面书写名称
            languageMap[`model.${namespace}.${modelId}.name`] = formData.modelName;
            saveNewMaidModelDialog.form.modelName.value = formData.modelName;
        }

        // 模型描述数据存储
        if (!isEmpty(formData.modelDesc)) {
            modelData["description"] = [`{model.${namespace}.${modelId}.desc}`];
            // 往语言文件里面书写描述
            languageMap[`model.${namespace}.${modelId}.desc`] = formData.modelDesc;
            saveNewMaidModelDialog.form.modelDesc.value = formData.modelDesc;
        }

        // 兼容性数据书写
        if (formData.renderItemScale !== 1) {
            modelData["render_item_scale"] = formData.renderItemScale;
            saveNewMaidModelDialog.form.renderItemScale.value = formData.renderItemScale;
        }
        if (formData.renderEntityScale !== 1) {
            modelData["render_entity_scale"] = formData.renderEntityScale;
            saveNewMaidModelDialog.form.renderEntityScale.value = formData.renderEntityScale;
        }
        if (!formData.showHata) {
            modelData["show_hata"] = false;
            saveNewMaidModelDialog.form.showHata.value = false;
        }
        if (!formData.showBackpack) {
            modelData["show_backpack"] = false;
            saveNewMaidModelDialog.form.showBackpack.value = false;
        }
        if (!formData.canHoldTrolley) {
            modelData["can_hold_trolley"] = false;
            saveNewMaidModelDialog.form.canHoldTrolley.value = false;
        }
        if (!formData.canHoldVehicle) {
            modelData["can_hold_vehicle"] = false;
            saveNewMaidModelDialog.form.canHoldVehicle.value = false;
        }
        if (!formData.canRidingBroom) {
            modelData["can_riding_broom"] = false;
            saveNewMaidModelDialog.form.canRidingBroom.value = false;
        }
        if (!formData.showCustomHead) {
            modelData["show_custom_head"] = false;
            saveNewMaidModelDialog.form.showCustomHead.value = false;
        }

        // 彩蛋
        if (!isEmpty(formData.egg)) {
            let tag = formData.egg;
            if (formData.encryption) {
                tag = sha1(formData.egg);
            }
            modelData["easter_egg"] = {
                encrypt: formData.encryption,
                tag: tag
            };
        }

        // 动画脚本数据书写
        if (!isEmpty(formData.animation)) {
            let animationFilePath = formData.animation;
            let animationFileName = pathToName(animationFilePath).toLowerCase().replace(/\s|-/g, '_');
            modelData["animation"] = [`${namespace}:animation/${animationFileName}.js`];
        }

        // 检查重复 ID
        if (checkDuplicateModelId()) {
            Blockbench.showMessageBox({
                title: "检查到当前 ID 和已有模型 ID 重复",
                message: "是否继续进行保存？<br>这会覆盖掉同名模型的相关数据！",
                confirm: 0,
                cancel: 1,
                buttons: ["确认覆盖", "取消"]
            }, function (result) {
                if (result === 0) {
                    saveModel(modelData, formData.animation, languageMap, "maid_model");
                    // 隐藏对话框
                    saveNewMaidModelDialog.hide();
                }
            });
        } else {
            saveModel(modelData, formData.animation, languageMap, "maid_model");
            // 隐藏对话框
            saveNewMaidModelDialog.hide();
        }
    }
});

function saveModel(modelData, animationFilePath, languageMap, jsonFileName) {
    // 模型包文件地址
    let jsonFile = `${TLM_PROJECT_INFO.namespace_path}/${jsonFileName}.json`;
    // 模型文件地址
    let modelFilePath = `${TLM_PROJECT_INFO.models_path}/${TLM_PROJECT_INFO.model_id}.json`;

    // 模型改名
    Project.geometry_name = "model";
    Project.name = TLM_PROJECT_INFO.model_id;
    // 将导出路径修改为此路径
    // 这样后续 Ctrl + S 保存时候会自动覆盖
    ModelMeta.name = TLM_PROJECT_INFO.models_path;
    ModelMeta.export_path = modelFilePath;

    // 把模型添加到列表中
    addModelToList(modelData);

    // 各种文件的书写    
    if (!isEmpty(animationFilePath)) {
        let animationFileName = pathToName(animationFilePath).toLowerCase().replace(/\s|-/g, '_');
        fs.writeFileSync(`${TLM_PROJECT_INFO.animation_path}/${animationFileName}.js`, fs.readFileSync(animationFilePath));
    }
    fs.writeFileSync(jsonFile, autoStringify(TLM_PROJECT_INFO["pack_data"]));
    fs.writeFile(modelFilePath, Format.codec.compile(), function (err) {
    });

    // 语言文件
    for (let key of Object.keys(languageMap)) {
        addLanguageEntry(key, languageMap[key]);
    }
    saveLanguageFile();

    // 材质保存
    if (textures.length > 0) {
        // 实体模型是单材质，获取第一个即可
        let textureFile = textures[0];
        // 来自 Blockbench 的图片二进制文件获取，不太理解
        let image;
        if (textureFile.mode === 'link') {
            image = nativeImage.createFromPath(textureFile.source.replace(/\?\d+$/, '')).toPNG();
        } else {
            image = nativeImage.createFromDataURL(textureFile.source).toPNG();
        }
        // 存储地址构建
        let textureFilePath = `${TLM_PROJECT_INFO.textures_path}/${TLM_PROJECT_INFO.model_id}.png`;
        // 存储图片文件
        fs.writeFile(textureFilePath, image, function (err) {
        });
        // 设置图片的相关属性， 这样后续 Ctrl + S 保存时候会自动覆盖
        textureFile.name = `${TLM_PROJECT_INFO.model_id}.png`;
        textureFile.folder = TLM_PROJECT_INFO.textures_path;
        textureFile.path = textureFilePath;
        textureFile.saved = true;
    } else {
        // 图片不存在时警告
        Blockbench.notification("你当前没有创建材质！", "游戏内的该模型将没有材质！");
    }

    // 保存成功的提醒
    Blockbench.notification("模型导出成功！", "");
}

var saveNewChairModelDialog = new Dialog({
    id: "save_new_chair_model_dialog",
    title: "请输入模型相关参数",
    form: {
        modelId: {
            label: "模型 ID（必填）",
            type: "input",
            placeholder: "仅支持小写英文字符和 . 和 _"
        },
        modelName: {
            label: "模型名称（必填）",
            type: "input",
            placeholder: "建议使用英文描述"
        },
        line1: "_",
        modelDesc: {
            label: "模型描述（可选）",
            type: "input",
            placeholder: "留空表示不填写任何描述"
        },
        renderItemScale: {
            label: "渲染成物品时的大小",
            type: "number",
            value: 1.0,
            min: 0.1,
            max: 2,
            step: 0.05
        },
        mountedHeight: {
            label: "坐上去的高度",
            type: "number",
            value: 6,
            min: 0,
            max: 40,
            step: 1
        },
        tameableCanRide: {
            label: "女仆能否能主动坐上去",
            type: "checkbox",
            value: true
        },
        noGravity: {
            label: "坐垫可以浮空",
            type: "checkbox",
            value: false
        },
        animation: {
            label: "动画脚本（可选）",
            type: "file",
            extensions: ['blockbench'],
            filetype: 'JS'
        },
    },
    onConfirm: function (formData) {
        // 数据获取
        let namespace = TLM_PROJECT_INFO["namespace"];

        // 模型数据
        let modelData = {};
        let languageMap = {};

        // 将 ID 中的大写字符全部变成小写字符
        // 空格和 - 字符转换为下划线
        let modelId = formData.modelId.toLowerCase().replace(/\s|-/g, '_');

        // 必填数据的格式判定
        // ID 字符校验
        if (!(/^[\w.]+$/.test(modelId))) {
            Blockbench.notification("模型 ID 不合法！", "模型 ID 仅支持英文字母，下划线和英文点号！");
            return;
        }

        // 存储 id 数据
        TLM_PROJECT_INFO["model_id"] = modelId;
        // 存入模型数据
        modelData["model_id"] = `${namespace}:${modelId}`;

        // 模型名不能为空
        if (isEmpty(formData.modelName)) {
            Blockbench.notification("模型名称不能为空", "请输入一个可辨识的英文模型名称！");
            return;
        } else {
            // 往语言文件里面书写名称
            languageMap[`model.${namespace}.${modelId}.name`] = formData.modelName;
            saveNewChairModelDialog.form.modelName.value = formData.modelName;
        }

        // 模型描述数据存储
        if (!isEmpty(formData.modelDesc)) {
            modelData["description"] = [`{model.${namespace}.${modelId}.desc}`];
            // 往语言文件里面书写描述
            languageMap[`model.${namespace}.${modelId}.desc`] = formData.modelDesc;
            saveNewChairModelDialog.form.modelDesc.value = formData.modelDesc;
        }

        // 其他数据书写
        if (formData.renderItemScale !== 1) {
            modelData["render_item_scale"] = formData.renderItemScale;
            saveNewChairModelDialog.form.renderItemScale.value = formData.renderItemScale;
        }

        modelData["mounted_height"] = formData.mountedHeight;
        saveNewChairModelDialog.form.mountedHeight.value = formData.mountedHeight;

        if (!formData.tameableCanRide) {
            modelData["tameable_can_ride"] = false;
            saveNewChairModelDialog.form.tameableCanRide.value = false;
        }
        if (formData.noGravity) {
            modelData["no_gravity"] = true;
            saveNewChairModelDialog.form.noGravity.value = true;
        }
        // 动画脚本数据书写
        if (!isEmpty(formData.animation)) {
            let animationFilePath = formData.animation;
            let animationFileName = pathToName(animationFilePath).toLowerCase().replace(/\s|-/g, '_');
            modelData["animation"] = [`${namespace}:animation/${animationFileName}.js`];
        }

        // 检查重复 ID
        if (checkDuplicateModelId()) {
            Blockbench.showMessageBox({
                title: "检查到当前 ID 和已有模型 ID 重复",
                message: "是否继续进行保存？<br>这会覆盖掉同名模型的相关数据！",
                confirm: 0,
                cancel: 1,
                buttons: ["确认覆盖", "取消"]
            }, function (result) {
                if (result === 0) {
                    saveModel(modelData, formData.animation, languageMap, "maid_chair");
                    saveNewChairModelDialog.hide();
                }
            });
        } else {
            saveModel(modelData, formData.animation, languageMap, "maid_chair");
            saveNewChairModelDialog.hide();
        }
    }
});

var createMaidPackDialog = new Dialog({
    id: "create_maid_pack",
    title: "创建一个新的女仆模型包",
    form: {
        packName: {
            label: "女仆模型包名称（必填）",
            type: "input",
            placeholder: "建议使用英文描述"
        },
        line1: "_",
        author: {
            label: "作者（可选）",
            type: "input",
            placeholder: "用逗号分隔多个作者"
        },
        packDescription: {
            label: "女仆模型包描述（可选）",
            type: "input",
            placeholder: "留空表示不填写任何描述"
        },
        packDate: {
            label: "创建日期（可选）",
            type: "input",
            placeholder: "格式推荐 2020-3-28"
        },
        packIcon: {
            label: "游戏内标签图标（可选）",
            type: "file",
            extensions: ['png'],
            filetype: 'PNG'
        }
    },
    onConfirm: function (formData) {
        // 获取数据
        let namespace = TLM_PROJECT_INFO["namespace"];
        let namespacePath = TLM_PROJECT_INFO["namespace_path"];
        let langPath = TLM_PROJECT_INFO["lang_path"];
        let packVersion = TLM_PROJECT_INFO["version"];
        let packData = TLM_PROJECT_INFO["pack_data"];

        // 剔除包名首尾空格
        let packName = formData.packName.trim();

        // 包名不能为空
        if (isEmpty(packName)) {
            Blockbench.notification("资源包名称不能为空", "请输入一个可辨识的英文资源包名称！");
            return;
        } else {
            packData["pack_name"] = `{maid_pack.${namespace}.name}`;
            // 往语言文件里面书写名称
            addLanguageEntry(`maid_pack.${namespace}.name`, packName);
            saveLanguageFile();
        }

        // 作者数据
        if (!isEmpty(formData.author)) {
            // 依据逗号分隔作者名称
            let authorList = formData.author.split(/[,|，]/);
            for (let i = 0; i < authorList.length; i++) {
                authorList[i] = authorList[i].trim();
            }
            packData["author"] = authorList;
        }

        // 包描述
        if (!isEmpty(formData.packDescription)) {
            packData["description"] = [`{maid_pack.${namespace}.desc}`];
            // 往语言文件里面书写描述
            addLanguageEntry(`maid_pack.${namespace}.desc`, formData.packDescription);
            saveLanguageFile();
        }

        // 包的制作日期
        let packDate;
        if (isEmpty(formData.packDate)) {
            // 依据当前日期格式化一个
            packDate = dateFormat(new Date());
        } else {
            packDate = formData.packDate;
        }
        packData["date"] = packDate;

        // 包的图标
        if (!isEmpty(formData.packIcon)) {
            packData["icon"] = `${namespace}:textures/maid_icon.png`;
            let packIconPath = `${namespacePath}/textures/maid_icon.png`;
            fs.writeFileSync(packIconPath, fs.readFileSync(formData.packIcon));
        }

        // 包的版本
        packData["version"] = packVersion;

        // 模型列表
        packData["model_list"] = [];

        // 书写女仆模型包的文件
        let maidJsonFilePath = `${namespacePath}/maid_model.json`;
        fs.writeFileSync(maidJsonFilePath, autoStringify(packData));

        // 状态栏显示 
        Blockbench.notification('已创建女仆模型包！', `位于命名空间：${namespace}`);

        // 关闭当前窗口
        createMaidPackDialog.hide();

        // 打开模型信息填写页面
        saveNewMaidModelDialog.show();
    }
});

var createChairPackDialog = new Dialog({
    id: "create_chair_pack",
    title: "创建一个新的坐垫模型包",
    form: {
        packName: {
            label: "坐垫模型包名称（必填）",
            type: "input",
            placeholder: "建议使用英文描述"
        },
        line1: "_",
        author: {
            label: "作者（可选）",
            type: "input",
            placeholder: "用逗号分隔多个作者"
        },
        packDescription: {
            label: "坐垫模型包描述（可选）",
            type: "input",
            placeholder: "留空表示不填写任何描述"
        },
        packDate: {
            label: "创建日期（可选）",
            type: "input",
            placeholder: "格式推荐 2020-3-28"
        },
        packIcon: {
            label: "游戏内标签图标（可选）",
            type: "file",
            extensions: ['png'],
            filetype: 'PNG'
        }
    },
    onConfirm: function (formData) {
        // 获取数据
        let namespace = TLM_PROJECT_INFO["namespace"];
        let namespacePath = TLM_PROJECT_INFO["namespace_path"];
        let langPath = TLM_PROJECT_INFO["lang_path"];
        let packVersion = TLM_PROJECT_INFO["version"];
        let packData = TLM_PROJECT_INFO["pack_data"];

        // 剔除包名首尾空格
        let packName = formData.packName.trim();

        // 包名不能为空
        if (isEmpty(packName)) {
            Blockbench.notification("资源包名称不能为空", "请输入一个可辨识的英文资源包名称！");
            return;
        } else {
            packData["pack_name"] = `{chair_pack.${namespace}.name}`;
            // 往语言文件里面书写名称
            addLanguageEntry(`chair_pack.${namespace}.name`, packName);
            saveLanguageFile();
        }

        // 作者数据
        if (!isEmpty(formData.author)) {
            // 依据逗号分隔作者名称
            let authorList = formData.author.split(/[,|，]/);
            for (let i = 0; i < authorList.length; i++) {
                authorList[i] = authorList[i].trim();
            }
            packData["author"] = authorList;
        }

        // 包描述
        if (!isEmpty(formData.packDescription)) {
            packData["description"] = [`{chair_pack.${namespace}.desc}`];
            // 往语言文件里面书写描述
            addLanguageEntry(`chair_pack.${namespace}.desc`, formData.packDescription);
            saveLanguageFile();
        }

        // 包的制作日期
        let packDate;
        if (isEmpty(formData.packDate)) {
            // 依据当前日期格式化一个
            packDate = dateFormat(new Date());
        } else {
            packDate = formData.packDate;
        }
        packData["date"] = packDate;

        // 包的图标
        if (!isEmpty(formData.packIcon)) {
            packData["icon"] = `${namespace}:textures/chair_icon.png`;
            let packIconPath = `${namespacePath}/textures/chair_icon.png`;
            fs.writeFileSync(packIconPath, fs.readFileSync(formData.packIcon));
        }

        // 包的版本
        packData["version"] = packVersion;

        // 模型列表
        packData["model_list"] = [];

        // 书写坐垫模型包的文件
        let maidJsonFilePath = `${namespacePath}/maid_chair.json`;
        fs.writeFileSync(maidJsonFilePath, autoStringify(packData));

        // 状态栏显示        
        Blockbench.notification('已创建坐垫模型包！', `位于命名空间：${namespace}`);

        // 关闭当前窗口
        createChairPackDialog.hide();

        // 打开模型信息填写页面
        saveNewChairModelDialog.show();
    }
});

var exportPack = new Action('export_pack', {
    name: '导出模型',
    description: '将当前模型导出到资源包中',
    icon: 'archive',
    click: function () {
        // 先检查当前是否处于正确的导出状态
        // 工作区正确，而且模型材质不为空
        if (Format) {
            if (Format.id !== "bedrock_old") {
                Blockbench.showMessageBox({
                    title: "当前模型格式不正确！",
                    message: '模型格式只支持 <font color="red">旧版基岩版</font> 模型！<br>你可以通过 <font color="orange">文件/转换工程</font> 菜单进行格式转换！',
                    icon: "warning"
                }, function (result) {
                });
            } else {
                // 模型为空
                if (Outliner.root.length === 0) {
                    Blockbench.showMessageBox({
                        title: "当前模型为空！",
                        message: '请先创建模型，然后再进行导出！',
                        icon: "warning"
                    }, function (result) {
                    });
                } else {
                    // 材质为空，提醒
                    if (textures.length === 0) {
                        Blockbench.notification("你当前没有创建材质！", "你仍旧可以导出模型，但游戏内的该模型将没有材质！");
                    }
                    // 延迟打开，因为和前面的通知会存在冲突
                    setTimeout(() => {
                        // 选择放置资源包文件夹的窗口
                        ElecDialogs.showOpenDialog(currentwindow, {
                            title: "选择资源包文件夹",
                            properties: ['openDirectory']
                        }, function (path) {
                            if (path !== undefined && path !== null) {
                                checkIsPackFolder(path);
                            }
                        });
                    }, 25);
                }
            }
        } else {
            Blockbench.showMessageBox({
                title: "当前没有模型",
                message: '请先创建模型，然后再进行模型导出！',
                icon: "warning"
            }, function (result) {
            });
        }
    }
});

function checkIsPackFolder(path) {
    let namespace;
    let namespacePath;

    // 检查文件夹结构
    // 检查是否存在 pack.mcmeta 文件
    let mcmetaPath = `${path}/pack.mcmeta`;
    if (fs.existsSync(mcmetaPath)) {
        if (!fs.statSync(mcmetaPath).isFile()) {
            Blockbench.showMessageBox({
                title: "提示：",
                message: "选择的文件夹不是资源包，pack.mcmeta 应该是文件！",
                icon: "warning"
            }, function (result) {
            });
            return;
        }
    } else {
        Blockbench.showMessageBox({
            title: "提示：",
            message: "选择的文件夹不是资源包，缺少 pack.mcmeta 文件！",
            icon: "warning"
        }, function (result) {
        });
        return;
    }

    // 检查 assets 文件夹
    let assetsPath = `${path}/assets`;
    if (fs.existsSync(assetsPath)) {
        if (!fs.statSync(assetsPath).isDirectory()) {
            Blockbench.showMessageBox({
                title: "提示：",
                message: "选择的文件夹不是资源包，assets 应该是文件夹！",
                icon: "warning"
            }, function (result) {
            });
            return;
        }
    } else {
        Blockbench.showMessageBox({
            title: "提示：",
            message: "选择的文件夹不是资源包，缺少 assets 文件！",
            icon: "warning"
        }, function (result) {
        });
        return;
    }

    // 检查命名空间    
    let namespaceList = [];
    let namespaceFiles = fs.readdirSync(assetsPath);
    for (let file of namespaceFiles) {
        let stats = fs.statSync(`${assetsPath}/${file}`);
        if (stats.isDirectory()) {
            namespaceList.push(file);
        }
    }
    // 如果不存在命名空间
    if (namespaceList.length === 0) {
        Blockbench.showMessageBox({
            title: "提示：",
            message: "选择的文件夹不是资源包，缺少命名空间文件夹！",
            icon: "warning"
        }, function (result) {
        });
        return;
    }
    // 如果存在多个命名空间，弹出选择框
    if (namespaceList.length > 1) {
        let obj = {};
        for (let e of namespaceList) {
            obj[e] = e;
        }
        let select = new Dialog({
            title: "发现多个命名空间文件夹，请选择一个！",
            form: {
                folder: {
                    type: "select",
                    label: "命名空间",
                    default: namespaceList[0],
                    options: obj
                }
            },
            onConfirm: function (formData) {
                select.hide();
                namespace = formData.folder;
                namespacePath = `${assetsPath}/${formData.folder}`;

                // 检查通过，检查文件夹并进行创建
                mkdirs(`${namespacePath}/models/entity`);
                mkdirs(`${namespacePath}/textures/entity`);
                mkdirs(`${namespacePath}/lang`);
                mkdirs(`${namespacePath}/animation`);

                TLM_PROJECT_INFO.namespace = namespace;
                TLM_PROJECT_INFO.namespace_path = namespacePath;
                TLM_PROJECT_INFO.animation_path = `${namespacePath}/animation`;
                TLM_PROJECT_INFO.lang_path = `${namespacePath}/lang`;
                TLM_PROJECT_INFO.models_path = `${namespacePath}/models/entity`;
                TLM_PROJECT_INFO.textures_path = `${namespacePath}/textures/entity`;

                // 重读语言文件
                reloadAndReadLanguage();

                // 让使用者选择类型
                exportTypeDialog.show();
            }
        });
        select.show();
        return;
    }

    // 如果是单个文件夹，直接选择
    if (namespaceList.length === 1) {
        namespace = namespaceList[0];
        namespacePath = `${assetsPath}/${namespaceList[0]}`;

        // 检查通过，检查文件夹并进行创建
        mkdirs(`${namespacePath}/models/entity`);
        mkdirs(`${namespacePath}/textures/entity`);
        mkdirs(`${namespacePath}/lang`);
        mkdirs(`${namespacePath}/animation`);

        TLM_PROJECT_INFO.namespace = namespace;
        TLM_PROJECT_INFO.namespace_path = namespacePath;
        TLM_PROJECT_INFO.animation_path = `${namespacePath}/animation`;
        TLM_PROJECT_INFO.lang_path = `${namespacePath}/lang`;
        TLM_PROJECT_INFO.models_path = `${namespacePath}/models/entity`;
        TLM_PROJECT_INFO.textures_path = `${namespacePath}/textures/entity`;

        // 重读语言文件
        reloadAndReadLanguage();

        // 让使用者选择类型
        exportTypeDialog.show();
    }
}

var exportTypeDialog = new Dialog({
    id: "export_type_dialog",
    title: "选择导出类型",
    form: {
        bindType: {
            type: "select",
            label: "导出类型",
            default: 'maid',
            options: {
                maid: "女仆模型",
                chair: "坐垫模型",
            }
        }
    },
    onConfirm: function (formData) {
        if (formData.bindType === "chair") {
            // 存储数据
            TLM_PROJECT_INFO["type"] = "chair";
            // 依据绑定类型检查对应文件是否存在
            let chairModelFile = `${TLM_PROJECT_INFO.namespace_path}/maid_chair.json`;
            if (fs.existsSync(chairModelFile) && fs.statSync(chairModelFile).isFile()) {
                // 剔除 JSON 开头的 BOM 标记
                let text = fs.readFileSync(chairModelFile, 'utf8').replace(/^\uFEFF/, "");
                TLM_PROJECT_INFO.pack_data = JSON.parse(text);
                // version 的书写
                let version = TLM_PROJECT_INFO.pack_data.version;
                if (isEmpty(version)) {
                    TLM_PROJECT_INFO.pack_data.version = "1.0.0";
                    TLM_PROJECT_INFO.version = "1.0.0";
                } else {
                    TLM_PROJECT_INFO.version = version;
                }
                exportTypeDialog.hide();
                // 打开模型信息填写页面
                saveNewChairModelDialog.show();
            } else {
                TLM_PROJECT_INFO.version = "1.0.0";
                TLM_PROJECT_INFO.pack_data = {};
                Blockbench.notification("该资源包没有坐垫模型包", "请填写对话框，完善坐垫模型包相关数据");
                createChairPackDialog.show();
            }
        }
        if (formData.bindType === "maid") {
            // 存储数据
            TLM_PROJECT_INFO["type"] = "maid";
            // 依据绑定类型检查对应文件是否存在
            let maidModelFile = `${TLM_PROJECT_INFO.namespace_path}/maid_model.json`;
            if (fs.existsSync(maidModelFile) && fs.statSync(maidModelFile).isFile()) {
                // 剔除 JSON 开头的 BOM 标记
                let text = fs.readFileSync(maidModelFile, 'utf8').replace(/^\uFEFF/, "");
                TLM_PROJECT_INFO.pack_data = JSON.parse(text);
                // version 的书写
                let version = TLM_PROJECT_INFO.pack_data.version;
                if (isEmpty(version)) {
                    TLM_PROJECT_INFO.pack_data.version = "1.0.0";
                    TLM_PROJECT_INFO.version = "1.0.0";
                } else {
                    TLM_PROJECT_INFO.version = version;
                }
                exportTypeDialog.hide();
                // 打开模型信息填写页面
                saveNewMaidModelDialog.show();
            } else {
                TLM_PROJECT_INFO.version = "1.0.0";
                TLM_PROJECT_INFO.pack_data = {};
                Blockbench.notification("该资源包没有女仆模型包", "请填写对话框，完善女仆模型包相关数据");
                createMaidPackDialog.show();
            }
        }
    }
});

function registerTextureEvent() {
    Blockbench.on("add_texture", changeTextureName);
    Blockbench.on("new_project", removeAllInfo);
}

function removeTextureEvent() {
    Blockbench.removeListener("add_texture", changeTextureName);
    Blockbench.removeListener("new_project", removeAllInfo);
}

function changeTextureName(data) {
    // 如果 modelId 为空，不进行修改
    let modelId = TLM_PROJECT_INFO.model_id;
    let texturePath = TLM_PROJECT_INFO.textures_path;
    let textureName = TLM_PROJECT_INFO.texture_name;
    if (!isEmpty(modelId) && !isEmpty(texturePath) && !isEmpty(textureName)) {
        // 如果不为空，进行二次判定
        let textureFile = data.texture;
        // 设置图片的相关属性， 这样后续 Ctrl + S 保存时候会自动覆盖
        textureFile.name = textureName;
        textureFile.folder = texturePath;
        textureFile.path = `${texturePath}/${textureName}`;
        Blockbench.notification("自动材质定位：", "检测到你已经绑定了资源包，并设置了模型数据。自动定位创建的材质！");
    }
}

function removeAllInfo() {
    clearAll();
}

var loadPack = new Action('load_pack', {
    name: '导入模型',
    description: '从已有资源包中导入模型',
    icon: 'unarchive',
    cachePath: "",
    click: function () {
        // 新建一个项目
        if (newProject(Formats['bedrock_old'], false)) {
            // 选择放置资源包文件夹的窗口
            ElecDialogs.showOpenDialog(currentwindow, {
                title: "选择导入的资源包文件夹",
                properties: ['openDirectory']
            }, function (path) {
                if (path !== undefined && path !== null && path.length > 0) {
                    checkIsPackFolder$1(path);
                }
            });
        }
    }
});


function checkIsPackFolder$1(path) {
    let namespace;
    let namespacePath;

    // 检查文件夹结构
    // 检查是否存在 pack.mcmeta 文件
    let mcmetaPath = `${path}/pack.mcmeta`;
    if (fs.existsSync(mcmetaPath)) {
        if (!fs.statSync(mcmetaPath).isFile()) {
            Blockbench.showMessageBox({
                title: "提示：",
                message: "选择的文件夹不是资源包，pack.mcmeta 应该是文件！",
                icon: "warning"
            }, function (result) {
            });
            return;
        }
    } else {
        Blockbench.showMessageBox({
            title: "提示：",
            message: "选择的文件夹不是资源包，缺少 pack.mcmeta 文件！",
            icon: "warning"
        }, function (result) {
        });
        return;
    }

    // 检查 assets 文件夹
    let assetsPath = `${path}/assets`;
    if (fs.existsSync(assetsPath)) {
        if (!fs.statSync(assetsPath).isDirectory()) {
            Blockbench.showMessageBox({
                title: "提示：",
                message: "选择的文件夹不是资源包，assets 应该是文件夹！",
                icon: "warning"
            }, function (result) {
            });
            return;
        }
    } else {
        Blockbench.showMessageBox({
            title: "提示：",
            message: "选择的文件夹不是资源包，缺少 assets 文件！",
            icon: "warning"
        }, function (result) {
        });
        return;
    }

    // 检查命名空间    
    let namespaceList = [];
    let namespaceFiles = fs.readdirSync(assetsPath);
    for (let file of namespaceFiles) {
        let stats = fs.statSync(`${assetsPath}/${file}`);
        if (stats.isDirectory()) {
            namespaceList.push(file);
        }
    }
    // 如果不存在命名空间
    if (namespaceList.length === 0) {
        Blockbench.showMessageBox({
            title: "提示：",
            message: "选择的文件夹不是资源包，缺少命名空间文件夹！",
            icon: "warning"
        }, function (result) {
        });
        return;
    }
    // 如果存在多个命名空间，弹出选择框
    if (namespaceList.length > 1) {
        let obj = {};
        for (let e of namespaceList) {
            obj[e] = e;
        }
        let select = new Dialog({
            title: "发现多个命名空间文件夹，请选择一个！",
            form: {
                folder: {
                    type: "select",
                    label: "命名空间",
                    default: namespaceList[0],
                    options: obj
                }
            },
            onConfirm: function (formData) {
                select.hide();
                namespace = formData.folder;
                namespacePath = `${assetsPath}/${formData.folder}`;

                // 检查通过，检查文件夹并进行创建
                mkdirs(`${namespacePath}/models/entity`);
                mkdirs(`${namespacePath}/textures/entity`);
                mkdirs(`${namespacePath}/lang`);
                mkdirs(`${namespacePath}/animation`);

                TLM_PROJECT_INFO.namespace = namespace;
                TLM_PROJECT_INFO.namespace_path = namespacePath;
                TLM_PROJECT_INFO.animation_path = `${namespacePath}/animation`;
                TLM_PROJECT_INFO.lang_path = `${namespacePath}/lang`;
                TLM_PROJECT_INFO.models_path = `${namespacePath}/models/entity`;
                TLM_PROJECT_INFO.textures_path = `${namespacePath}/textures/entity`;

                // 重读语言文件
                reloadAndReadLanguage();

                // 运用选择模型逻辑
                chooseMaidOrChair(namespacePath);
            }
        });
        select.show();
        return;
    }

    // 如果是单个文件夹，直接选择
    if (namespaceList.length === 1) {
        namespace = namespaceList[0];
        namespacePath = `${assetsPath}/${namespaceList[0]}`;

        // 检查通过，检查文件夹并进行创建
        mkdirs(`${namespacePath}/models/entity`);
        mkdirs(`${namespacePath}/textures/entity`);
        mkdirs(`${namespacePath}/lang`);
        mkdirs(`${namespacePath}/animation`);

        TLM_PROJECT_INFO.namespace = namespace;
        TLM_PROJECT_INFO.namespace_path = namespacePath;
        TLM_PROJECT_INFO.animation_path = `${namespacePath}/animation`;
        TLM_PROJECT_INFO.lang_path = `${namespacePath}/lang`;
        TLM_PROJECT_INFO.models_path = `${namespacePath}/models/entity`;
        TLM_PROJECT_INFO.textures_path = `${namespacePath}/textures/entity`;

        // 重读语言文件
        reloadAndReadLanguage();

        // 运用选择模型逻辑
        chooseMaidOrChair(namespacePath);
    }
}

function chooseMaidOrChair(namespacePath) {
    // 两个模型描述文件
    let maidModelFile = `${namespacePath}/maid_model.json`;
    let chairModelFile = `${namespacePath}/maid_chair.json`;

    // 都不存在，弹出提示
    if (!fs.existsSync(maidModelFile) && !fs.existsSync(chairModelFile)) {
        Blockbench.showMessageBox({
            title: "提示：",
            message: "该资源包不包含模型描述文件，请确认选择了正确的资源包！",
            icon: "warning"
        }, function (result) {
        });
        return;
    }

    // 都存在，让使用者选择
    if (fs.existsSync(maidModelFile) && fs.existsSync(chairModelFile)) {
        bindTypeDialog.show();
        return;
    }

    // 存在其中一个，直接弹出选择界面
    if (fs.existsSync(maidModelFile)) {
        // 存储数据
        TLM_PROJECT_INFO["type"] = "maid";
        readPackInfo(maidModelFile);
        return;
    }
    if (fs.existsSync(chairModelFile)) {
        // 存储数据
        TLM_PROJECT_INFO["type"] = "chair";
        readPackInfo(chairModelFile);
    }
}

var bindTypeDialog = new Dialog({
    id: "bind_type_dialog",
    title: "选择绑定类型",
    form: {
        bindType: {
            type: "select",
            label: "绑定类型",
            default: 'maid',
            options: {
                maid: "女仆模型",
                chair: "坐垫模型",
            }
        }
    },
    onConfirm: function (formData) {
        if (formData.bindType === "chair") {
            // 存储数据
            TLM_PROJECT_INFO["type"] = "chair";
            readPackInfo(`${TLM_PROJECT_INFO.namespace_path}/maid_chair.json`);
        }
        if (formData.bindType === "maid") {
            // 存储数据
            TLM_PROJECT_INFO["type"] = "maid";
            readPackInfo(`${TLM_PROJECT_INFO.namespace_path}/maid_model.json`);
        }
    }
});

function readPackInfo(filePath) {
    // 剔除文件头部的 BOM 字符
    let text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, "");
    TLM_PROJECT_INFO.pack_data = JSON.parse(text);
    // 版本的提取
    let version = TLM_PROJECT_INFO.pack_data.version;
    if (isEmpty(version)) {
        TLM_PROJECT_INFO.pack_data.version = "1.0.0";
        TLM_PROJECT_INFO.version = "1.0.0";
    } else {
        TLM_PROJECT_INFO.version = version;
    }

    // 模型列表为空的提示
    let modelList = TLM_PROJECT_INFO.pack_data.model_list;
    if (modelList === undefined || modelList === null || modelList.length < 1) {
        Blockbench.showMessageBox({
            title: "提示：",
            message: "检测到该包不包含模型，请确认你选择了正确的资源包！",
            icon: "warning"
        }, function (result) {
        });
        return;
    }
    // 获取一个包含 模型 ID -> 模型名称 的对象
    let id2Name = {};
    let lang = getChineseLanguage();

    // 获取选择列表的显示
    modelList.forEach(function (model) {
        let modelId = model.model_id.split(":", 2)[1];
        let name = model.name;

        // 模型没有名称字段
        if (isEmpty(name)) {
            // 依据默认规则获取语言文件的 key
            let key = `model.${model.model_id.replace(":", ".")}.name`;
            // 如果语言文件不包含该 key，直接以模型 id 作为名称
            if (isEmpty(lang[key])) {
                id2Name[modelId] = modelId;
            }
            // 如果语言文件包含 key，获取指定的本地化名称
            else {
                id2Name[modelId] = lang[key];
            }
        }
        // 模型有名称字段
        else {
            // 模型使用的是本地化方式
            if (name.indexOf("{") === 0 && name.indexOf("}") === (name.length - 1)) {
                // 获取对应的 key
                let key = name.replace(/^{/, "").replace(/}$/, "");
                // 如果语言文件不包含该 key，直接以模型 id 作为名称
                if (isEmpty(lang[key])) {
                    id2Name[modelId] = modelId;
                }
                // 如果语言文件包含 key，获取指定的本地化名称
                else {
                    id2Name[modelId] = lang[key];
                }
            }
            // 否则直接获取名称字段
            else {
                id2Name[modelId] = name;
            }
        }
    });

    let selectModelDialog = new Dialog({
        id: "select_model_dialog",
        title: "请选择模型",
        form: {
            modelId: {
                type: "select",
                label: "选择模型",
                options: id2Name
            }
        },
        onConfirm: function (formData) {
            selectModelDialog.hide();

            // 依据 ID 获取对应条目
            TLM_PROJECT_INFO.model_id = formData.modelId;
            let modelId = `${TLM_PROJECT_INFO.namespace}:${formData.modelId}`;
            let modelData;
            modelList.forEach(function (model) {
                if (model.model_id === modelId) {
                    modelData = model;
                }
            });

            if (modelData === undefined || modelData === null) {
                console.exception("严重错误！选取的模型不在模型列表中！");
                return;
            }

            // 默认位置的书写
            let modelFilePath = `${TLM_PROJECT_INFO.models_path}/${formData.modelId}.json`;
            let textureFilePath = `${TLM_PROJECT_INFO.textures_path}/${formData.modelId}.png`;

            // 如果显示声明了位置，进行覆盖
            if (!isEmpty(modelData.model)) {
                // 拆分出 namespace
                let ns = modelData.model.split(":", 2)[0];
                let path = modelData.model.split(":", 2)[1];
                // 检查命名空间
                if (ns !== TLM_PROJECT_INFO.namespace) {
                    Blockbench.showMessageBox({
                        title: "异常：",
                        message: "检测到选择的模型含了其他外部文件，无法进行加载！",
                        icon: "warning"
                    }, function (result) {
                    });
                    return;
                } else {
                    modelFilePath = `${TLM_PROJECT_INFO.namespace_path}/${path}`;
                }
            }

            // 如果显示声明了位置，进行覆盖
            if (!isEmpty(modelData.texture)) {
                // 拆分出 namespace
                let ns = modelData.texture.split(":", 2)[0];
                let path = modelData.texture.split(":", 2)[1];
                // 检查命名空间
                if (ns !== TLM_PROJECT_INFO.namespace) {
                    Blockbench.showMessageBox({
                        title: "异常：",
                        message: "检测到选择的模型材质包含了其他外部文件，无法进行加载！",
                        icon: "warning"
                    }, function (result) {
                    });
                    return;
                } else {
                    textureFilePath = `${TLM_PROJECT_INFO.namespace_path}/${path}`;
                }
            }

            Blockbench.read([modelFilePath], {
                errorbox: true
            }, function (files) {
                // 加载模型
                loadModelFile(files[0]);
                // 模型改名
                Project.geometry_name = "model";
                Project.name = TLM_PROJECT_INFO.model_id;
                // 将导出路径修改为此路径
                // 这样后续 Ctrl + S 保存时候会自动覆盖
                ModelMeta.name = path.dirname(modelFilePath);
                ModelMeta.export_path = modelFilePath;

                // 材质加载
                Blockbench.read([textureFilePath], {
                    readtype: "image",
                    errorbox: true
                }, function (files) {
                    files.forEach(function (f) {
                        TLM_PROJECT_INFO.textures_path = path.dirname(f.path);
                        TLM_PROJECT_INFO.texture_name = f.name;
                        new Texture({
                            name: f.name,
                            folder: path.dirname(f.path),
                            path: f.path,
                        }).fromFile(f).add(false);
                    });
                });
            });
        }
    });
    selectModelDialog.show();
}

function getChineseLanguage() {
    let englishFile = `${TLM_PROJECT_INFO["lang_path"]}/en_us.lang`;
    let chineseFile = `${TLM_PROJECT_INFO["lang_path"]}/zh_cn.lang`;
    let output = {};
    if (fs.existsSync(englishFile) && fs.statSync(englishFile).isFile()) {
        let allText = fs.readFileSync(englishFile, 'utf8');
        allText.split(/\r?\n/).forEach(function (line) {
            // 排除 # 开头的注释
            if (line.indexOf("#") !== 0) {
                let text = line.split("=", 2);
                if (!isEmpty(text[0]) && !isEmpty(text[1])) {
                    output[text[0]] = text[1];
                }
            }
        });
    }
    if (fs.existsSync(chineseFile) && fs.statSync(chineseFile).isFile()) {
        let allText = fs.readFileSync(chineseFile, 'utf8');
        allText.split(/\r?\n/).forEach(function (line) {
            // 排除 # 开头的注释
            if (line.indexOf("#") !== 0) {
                let text = line.split("=", 2);
                if (!isEmpty(text[0]) && !isEmpty(text[1])) {
                    output[text[0]] = text[1];
                }
            }
        });
    }
    return output;
}

var format_version = "1.10.0";
var defaultMaidModel = {
	format_version: format_version,
	"geometry.model": {
	texturewidth: 128,
	textureheight: 128,
	visible_bounds_width: 3,
	visible_bounds_height: 2,
	visible_bounds_offset: [
		0,
		1,
		0
	],
	bones: [
		{
			name: "head",
			pivot: [
				0,
				18,
				0
			],
			cubes: [
				{
					origin: [
						-4,
						18,
						-4
					],
					size: [
						8,
						8,
						8
					],
					uv: [
						0,
						0
					]
				}
			]
		},
		{
			name: "ahoge",
			parent: "head",
			pivot: [
				0,
				26,
				0
			],
			cubes: [
				{
					origin: [
						-3,
						26,
						0
					],
					size: [
						6,
						6,
						0
					],
					uv: [
						0,
						0
					]
				}
			]
		},
		{
			name: "blink",
			parent: "head",
			pivot: [
				0,
				18,
				0
			],
			cubes: [
				{
					origin: [
						-4,
						18,
						-4.001
					],
					size: [
						8,
						8,
						0
					],
					uv: [
						44,
						28
					]
				}
			]
		},
		{
			name: "armRight",
			pivot: [
				-3,
				17.5,
				0
			],
			rotation: [
				0,
				0,
				25
			],
			cubes: [
				{
					origin: [
						-5,
						8.5,
						-1
					],
					size: [
						2,
						8,
						2
					],
					uv: [
						32,
						40
					]
				},
				{
					origin: [
						-5.5,
						13.5,
						-1.5
					],
					size: [
						3,
						4,
						3
					],
					uv: [
						12,
						46
					]
				}
			]
		},
		{
			name: "armLeft",
			pivot: [
				3,
				17.5,
				0
			],
			rotation: [
				0,
				0,
				-25
			],
			cubes: [
				{
					origin: [
						2.5,
						13.5,
						-1.5
					],
					size: [
						3,
						4,
						3
					],
					uv: [
						12,
						40
					]
				},
				{
					origin: [
						3,
						8.5,
						-1
					],
					size: [
						2,
						8,
						2
					],
					uv: [
						24,
						40
					]
				}
			]
		},
		{
			name: "body",
			pivot: [
				0,
				10.5,
				0
			],
			cubes: [
				{
					origin: [
						-3,
						11.999,
						-3
					],
					size: [
						6,
						6,
						6
					],
					uv: [
						56,
						16
					]
				},
				{
					origin: [
						-3.5,
						10,
						-3.5
					],
					size: [
						7,
						2,
						7
					],
					uv: [
						28,
						16
					]
				},
				{
					origin: [
						-4,
						8,
						-4
					],
					size: [
						8,
						2,
						8
					],
					uv: [
						68,
						0
					]
				},
				{
					origin: [
						-4.5,
						6,
						-4.5
					],
					size: [
						9,
						2,
						9
					],
					uv: [
						32,
						0
					]
				},
				{
					origin: [
						-4,
						7.999,
						-2
					],
					size: [
						8,
						2,
						4
					],
					uv: [
						20,
						28
					]
				}
			]
		},
		{
			name: "legLeft",
			pivot: [
				2,
				9,
				0
			],
			cubes: [
				{
					origin: [
						0.499,
						0,
						-1.5
					],
					size: [
						3,
						9,
						3
					],
					uv: [
						0,
						40
					]
				}
			]
		},
		{
			name: "legRight",
			pivot: [
				-2,
				9,
				0
			],
			cubes: [
				{
					origin: [
						-3.499,
						0,
						-1.5
					],
					size: [
						3,
						9,
						3
					],
					uv: [
						60,
						28
					]
				}
			]
		},
		{
			name: "wingLeft",
			pivot: [
				0.5,
				15,
				3.25
			],
			rotation: [
				0,
				60,
				0
			],
			cubes: [
				{
					origin: [
						0.5,
						3,
						3.5
					],
					size: [
						0,
						24,
						13
					],
					uv: [
						0,
						0
					]
				}
			]
		},
		{
			name: "wingRight",
			pivot: [
				-0.5,
				15,
				3.75
			],
			rotation: [
				0,
				-60,
				0
			],
			cubes: [
				{
					origin: [
						-0.5,
						3,
						3.5
					],
					size: [
						0,
						24,
						13
					],
					uv: [
						0,
						0
					]
				}
			]
		},
		{
			name: "tail",
			pivot: [
				0,
				8,
				4
			],
			rotation: [
				20,
				0,
				0
			],
			cubes: [
				{
					origin: [
						-1,
						7,
						4
					],
					size: [
						2,
						2,
						3
					],
					uv: [
						0,
						0
					]
				}
			]
		}
	]
}
};

var createDefaultMaidModel = new Action('create_default_maid_model', {
    name: '新建工作区',
    description: '创建一个默认标准格式的女仆模型',
    icon: 'fa-file-alt',
    click: function () {
        // 新建一个项目
        if (newProject(Formats['bedrock_old'], false)) {
            let copyModel = JSON.parse(JSON.stringify(defaultMaidModel));
            let exportDefaultModelDialog = new Dialog({
                title: "请选择你想要导入的模型部件",
                form: {
                    head: {
                        label: "头部",
                        type: "checkbox",
                        value: true
                    },
                    blink: {
                        label: "眨眼表情",
                        type: "checkbox",
                        value: true
                    },
                    body: {
                        label: "身体",
                        type: "checkbox",
                        value: true
                    },
                    armLeft: {
                        label: "左臂",
                        type: "checkbox",
                        value: true
                    },
                    armRight: {
                        label: "右臂",
                        type: "checkbox",
                        value: true
                    },
                    legLeft: {
                        label: "左腿",
                        type: "checkbox",
                        value: true
                    },
                    legRight: {
                        label: "右腿",
                        type: "checkbox",
                        value: true
                    },
                    wingLeft: {
                        label: "左侧翅膀",
                        type: "checkbox",
                        value: false
                    },
                    wingRight: {
                        label: "右侧翅膀",
                        type: "checkbox",
                        value: false
                    },
                    tail: {
                        label: "尾巴",
                        type: "checkbox",
                        value: false
                    },
                    ahoge: {
                        label: "呆毛",
                        type: "checkbox",
                        value: false
                    }
                },
                onConfirm: function (formData) {
                    let bones = copyModel["geometry.model"]["bones"];
                    for (let i in formData) {
                        for (let j = 0; j < bones.length; j++) {
                            if (bones[j].name === i && !formData[i]) {
                                bones.splice(j, 1);
                                break;
                            }
                        }
                    }
                    exportDefaultModelDialog.hide();
                    Codecs["bedrock_old"].parse(copyModel, null);
                }
            });
            exportDefaultModelDialog.show();
        }
    }
});

var addBoneMenu = {
    is_tlm_add_menu: true,
    icon: 'fa-chart-pie',
    name: '生成动画骨骼',
    description: "生成一些拥有默认动画的骨骼",
    condition: {modes: ['edit']},
    children: function () {
        let out = [
            {
                icon: 'fa-home',
                name: '基础部分',
                description: "头、手、腿等基础动画部件",
                children: []
            }, {
                icon: 'fa-expand-arrows-alt',
                name: '额外部件',
                description: "翅膀、呆毛，尾巴等额外动画部件",
                children: []
            }, {
                icon: 'fa-tshirt',
                name: '护甲',
                description: "各个护甲部件",
                children: []
            }, {
                icon: 'fa-minus-circle',
                name: '隐藏护甲',
                description: "各个隐藏式护甲部件",
                children: []
            }, {
                icon: 'fa-crosshairs',
                name: '定位骨骼',
                description: "各个定位骨骼部件",
                children: []
            }
        ];
        for (let o of boneNameList) {
            switch (o.group) {
                case "base":
                    out[0].children.push(getMenu(o));
                    break;
                case "extra":
                    out[1].children.push(getMenu(o));
                    break;
                case "armor":
                    out[2].children.push(getMenu(o));
                    break;
                case "hide_armor":
                    out[3].children.push(getMenu(o));
                    break;
                case "position":
                    out[4].children.push(getMenu(o));
                    break;
            }
        }
        return out;
    }
};

function getMenu(menu) {
    return {
        icon: "fa-chevron-circle-right",
        name: menu.name,
        condition: {modes: ['edit'], method: () => (Format.id === "bedrock_old")},
        description: menu.description,
        color: menu.color,
        click: function (group) {
            let allGroups = Group.all.slice();
            let boneName;
            if (Array.isArray(menu.bone)) {
                let allBone = menu.bone.slice();
                // 做布尔操作，将重复的进行剔除
                for (let g of allGroups) {
                    if (allBone.includes(g.name)) {
                        allBone.splice(allBone.indexOf(g.name), 1);
                    }
                }
                if (allBone.length < 1) {
                    // 布尔操作后为空，说明已经全部覆盖
                    Blockbench.notification("重名骨骼", "发现当前名称骨骼已经存在，创建失败");
                    return;
                } else {
                    // 否则取第一个即可
                    boneName = allBone[0];
                }
            } else {
                // 检查重名
                for (let g of allGroups) {
                    if (g.name === menu.bone) {
                        Blockbench.notification("重名骨骼", "发现当前名称骨骼已经存在，创建失败");
                        return;
                    }
                }
                boneName = menu.bone;
            }

            // 父类骨骼检查
            if (menu.parents) {
                if (menu.parents.length < 1) {
                    // 如果长度为 0，说明检查的是 root Group
                    if (group) {
                        Blockbench.notification("骨骼位置不对", "当前骨骼必须最顶层骨骼！");
                        return;
                    }
                } else {
                    // 长度不为 0，说明检查的是特定名称骨骼
                    if (!group || !menu.parents.includes(group.name)) {
                        Blockbench.notification("骨骼位置不对", `当前骨骼必须位于 ${menu.parents} 骨骼之下！`);
                        return;
                    }
                }
            }

            Undo.initEdit({outliner: true, elements: [], selection: true});
            let cubesBefore = elements.length;
            // 生成骨骼
            let baseGroup = new Group({
                name: boneName,
                origin: group ? group.origin : undefined
            });
            baseGroup.addTo(group);
            // 不明白的参数
            baseGroup.isOpen = true;
            baseGroup.init().select();
            Undo.finishEdit('add_bone', {
                outliner: true,
                elements: elements.slice().slice(cubesBefore),
                selection: true
            });
        }
    };
}

var boneNameList = [
    {bone: "head", name: "头部", description: "头部旋转，祈求动作", color: "#718c00", parents: [], group: "base"},
    {
        bone: "armLeft",
        name: "左臂",
        description: "行走时手臂动画效果，手臂末端持有物品的显示，待命时手臂合拢效果",
        color: "#718c00",
        parents: [],
        group: "base"
    },
    {
        bone: "armRight",
        name: "右臂",
        description: "行走时手臂动画效果，手臂末端持有物品的显示，待命时手臂合拢效果",
        color: "#718c00",
        parents: [],
        group: "base"
    },
    {bone: "legLeft", name: "左腿", description: "行走时腿部动画效果，待命骑行时腿部坐下效果", color: "#718c00", parents: [], group: "base"},
    {bone: "legRight", name: "右腿", description: "行走时腿部动画效果，待命骑行时腿部坐下效果", color: "#718c00", parents: [], group: "base"},
    {bone: "wingLeft", name: "左翅膀", description: "翅膀往复摆动画", color: "#fe9750", group: "extra"},
    {bone: "wingRight", name: "右翅膀", description: "翅膀往复摆动画", color: "#fe9750", group: "extra"},
    {bone: "ahoge", name: "呆毛", description: "祈求状态下的呆毛圆锥摆动画", color: "#fe9750", parents: ["head"], group: "extra"},
    {bone: "blink", name: "眨眼", description: "日常的眨眼动画", color: "#fe9750", parents: ["head"], group: "base"},
    {bone: "tail", name: "尾巴", description: "以旋转点为中心，Z 方向的小幅度圆锥摆", color: "#fe9750", group: "extra"},
    {
        bone: ["sinFloat", "cosFloat", "_sinFloat", "_cosFloat"],
        name: "漂浮部件",
        description: "以旋转点为中心的上下小距离浮动",
        color: "#fe9750",
        group: "extra"
    },
    {
        bone: "helmet",
        name: "头盔",
        description: "穿戴头盔后显示该模型",
        color: "#66cccc",
        group: "armor"
    },
    {
        bone: ["chestPlate", "chestPlateLeft", "chestPlateMiddle", "chestPlateRight"],
        name: "胸甲",
        description: "穿戴胸甲后显示该模型", color: "#66cccc", group: "armor"
    },
    {
        bone: ["leggings", "leggingsLeft", "leggingsMiddle", "leggingsRight"],
        name: "护腿",
        description: "穿戴护腿后显示该模型",
        color: "#66cccc", group: "armor"
    },
    {bone: ["bootsLeft", "bootsRight"], name: "靴子", description: "穿戴靴子后显示该模型", color: "#66cccc", group: "armor"},
    {
        bone: "_helmet", name: "反向头盔", description: "穿戴头盔后隐藏该模型", color: "#6699cc",
        group: "hide_armor"
    },
    {
        bone: ["_chestPlate", "_chestPlateLeft", "_chestPlateMiddle", "_chestPlateRight"],
        name: "反向胸甲",
        description: "穿戴胸甲后隐藏该模型",
        color: "#6699cc",
        group: "hide_armor"
    },
    {
        bone: ["_leggings", "_leggingsLeft", "_leggingsMiddle", "_leggingsRight"],
        name: "反向护腿",
        description: "穿戴护腿后隐藏该模型",
        color: "#6699cc",
        group: "hide_armor"
    },
    {
        bone: ["_bootsLeft", "_bootsRight"], name: "反向靴子", description: "穿戴靴子后隐藏该模型", color: "#6699cc",
        group: "hide_armor"
    },
    {
        bone: "armLeftPositioningBone",
        name: "左手臂定位骨骼",
        description: "女仆手持物品的定位骨骼，为空骨骼。空骨骼的旋转点决定了手持物品的起始位置",
        color: "#cc99cc",
        parents: ["armLeft"],
        group: "position"
    },
    {
        bone: "armRightPositioningBone",
        name: "右手臂定位骨骼",
        description: "女仆手持物品的定位骨骼，为空骨骼。它的旋转点决定了手持物品的起始位置",
        color: "#cc99cc",
        parents: ["armRight"],
        group: "position"
    },
    {
        bone: "backpackPositioningBone",
        name: "背包定位骨骼",
        description: "女仆背包的定位骨骼，为空骨骼。它的旋转点决定了背包肩带的中心点",
        color: "#cc99cc",
        parents: [],
        group: "position"
    },
];

var name = "tlm-utils";
var version = "1.0.3";
var author = "tartaric_acid";
var description = "Touhou Little Maid Mod Blockbench Plugin";
var repository = {
	type: "git",
	url: "https://github.com/TartaricAcid/TLM-Utils-Plugins"
};
var license = "MIT";
var engines = {
	node: "12.13.0",
	electron: "8.0.2",
	blockbench: "3.4.2"
};
var bugs = {
	url: "https://github.com/TartaricAcid/TLM-Utils-Plugins/issues",
	email: "baka943@qq.com"
};
var dependencies = {
	sha1: "^1.1.1"
};
var scripts = {
	start: "rollup -c"
};
var devDependencies = {
	rollup: "2.3.3",
	"@rollup/plugin-json": "latest",
	"@rollup/plugin-commonjs": "^12.0.0",
	"@rollup/plugin-node-resolve": "^8.0.0"
};
var tlmUtilsPackageJsonInfo = {
	name: name,
	version: version,
	author: author,
	description: description,
	repository: repository,
	license: license,
	engines: engines,
	bugs: bugs,
	dependencies: dependencies,
	scripts: scripts,
	devDependencies: devDependencies
};

var openWikiUrl = new Action('open_wiki_url', {
    name: '打开 wiki 页面',
    description: '打开车万女仆模组的 wiki 界面',
    icon: 'fa-book',
    click: function () {
        Blockbench.openLink("https://tlmwiki.cfpa.team/");
    }
});

var openMcbbsUrl = new Action('open_mcbbs_url', {
    name: '打开模型发布页面',
    description: '打开 MCBBS 的模型发布界面',
    icon: 'fa-swatchbook',
    click: function () {
        Blockbench.openLink("https://www.mcbbs.net/thread-1015497-1-1.html");
    }
});

var addSkirtMenu = {
    is_tlm_add_menu: true,
    icon: 'fa-female',
    name: '生成裙子',
    condition: {modes: ['edit'], method: () => (Format.id === "bedrock_old")},
    children: [
        {
            icon: 'fa-female',
            name: '下垂的长裙',
            click: function (group) {
                let formData = {
                    count: 14, width: 2, height: 12, length: 2, deg: 23
                };
                genSkirt(formData, group);
            }
        }, {
            icon: 'fa-female',
            name: '适中的裙子',
            click: function (group) {
                let formData = {
                    count: 12, width: 2, height: 8, length: 2, deg: 23
                };
                genSkirt(formData, group);
            }
        }, {
            icon: 'fa-female',
            name: '撑开的圆裙',
            click: function (group) {
                let formData = {
                    count: 16, width: 2, height: 8, length: 2, deg: 45
                };
                genSkirt(formData, group);
            }
        }, {
            icon: 'fa-female',
            name: '短裙',
            click: function (group) {
                let formData = {
                    count: 12, width: 2, height: 6, length: 2, deg: 45
                };
                genSkirt(formData, group);
            }
        }, {
            icon: 'fa-cogs',
            name: '自定义裙子',
            click: function (group) {
                addSkirt(group);
            }
        }
    ]
};

function addSkirt(rootGroup) {
    new Dialog({
        title: "输入裙子参数",
        form: {
            count: {
                type: "number",
                label: "裙褶个数",
                value: 12, min: 4, max: 50, step: 1
            },
            width: {
                type: "number",
                label: "裙褶长度",
                value: 2, min: 0, max: 10, step: 1
            },
            length: {
                type: "number",
                label: "裙褶宽度",
                value: 2, min: 0, max: 10, step: 1
            },
            height: {
                type: "number",
                label: "裙褶高度",
                value: 6, min: 1, max: 100, step: 1
            },
            deg: {
                type: "number",
                label: "裙褶倾角",
                value: 23, min: 0, max: 180, step: 1
            }
        },
        onConfirm: function (formData) {
            genSkirt(formData, rootGroup);
            this.hide();
        }
    }).show();
}

function genSkirt(formData, rootGroup) {
    let count = formData.count;
    let width = formData.width;
    let height = formData.height;
    let length = formData.length;
    let deg = formData.deg;

    Undo.initEdit({outliner: true, elements: [], selection: true});
    let cubesBefore = elements.length;

    // 如果没有选择任何组，那就创建一个组
    if (!rootGroup) {
        rootGroup = new Group({});
        // 检查骨骼命名
        if (Format.bone_rig) {
            rootGroup.createUniqueName();
        }
        rootGroup.init();
    }

    // 创建裙子
    let selectedGroup = rootGroup;
    if (!selectedGroup && selectedGroup.length) {
        Blockbench.notification("当前所选组不正确", "请选择或创建一个空组");
        return;
    }
    for (let i = 0; i < count; i++) {
        let z2 = Math.sqrt(length ** 2 + width ** 2) / 2 / Math.tan(Math.PI / count);
        selectedGroup = addSkirtGroup(selectedGroup, [0, 0, 0], [0, 360 / count * i, 0]);
        selectedGroup = addSkirtGroup(selectedGroup, [0, 0, z2], [-deg, 0, 0]);
        selectedGroup = addSkirtGroup(selectedGroup, [0, 0, z2], [0, Math.radToDeg(Math.atan(length / width)), 0]);
        addSkirtCube(selectedGroup, [-width / 2, 0, z2 - length / 2], [width, height, length]);
        selectedGroup = rootGroup;
    }

    Undo.finishEdit('add_skirt_bone', {
        outliner: true,
        elements: elements.slice().slice(cubesBefore),
        selection: true
    });

    rootGroup.select();
    Canvas.updateSelected();

}

function addSkirtCube(selectedGroup, start, size) {
    // 方块构建
    let baseCube = new Cube({
        autouv: (settings.autouv.value ? 1 : 0)
    }).init();
    baseCube.addTo(selectedGroup);
    // 方块参数设置
    if (Format.bone_rig) {
        if (selectedGroup) {
            let originPos = selectedGroup.origin.slice();
            baseCube.extend({
                from: [start[0], start[1], start[2]],
                to: [start[0] + size[0], start[1] + size[1], start[2] + size[2]],
                origin: originPos.slice()
            });
        }
    }
}

function addSkirtGroup(selectedGroup, pivot, rotation) {
    let baseGroup = new Group({
        origin: [pivot[0], pivot[1], pivot[2]],
        rotation: [rotation[0], rotation[1], rotation[2]]
    });
    baseGroup.addTo(selectedGroup);
    // 检查骨骼命名
    if (Format.bone_rig) {
        baseGroup.createUniqueName();
    }
    baseGroup.init();
    return baseGroup;
}

var addRibbonMenu = {
    is_tlm_add_menu: true,
    icon: 'fa-chart-line',
    name: '生成函数飘带',
    condition: {modes: ['edit'], method: () => (Format.id === "bedrock_old")},
    children: [
        {
            icon: 'fa-chart-line',
            name: "正弦飘带",
            children: [
                {
                    icon: 'fa-chart-line',
                    name: '正弦飘带',
                    click: function (group) {
                        addRibbon(group, "Math.sin(x)", 0, 2 * Math.PI);
                    }
                },
                {
                    icon: 'fa-chart-line',
                    name: '大正弦飘带',
                    click: function (group) {
                        addRibbon(group, "2*Math.sin(x/2)", 0, 4 * Math.PI);
                    }
                }, {
                    icon: 'fa-chart-line',
                    name: '窄正弦飘带',
                    click: function (group) {
                        addRibbon(group, "2*Math.sin(x)", 0, 2 * Math.PI);
                    }
                }, {
                    icon: 'fa-chart-line',
                    name: '缓正弦飘带',
                    click: function (group) {
                        addRibbon(group, "Math.sin(x/2)", 0, 4 * Math.PI);
                    }
                }
            ]
        }, {
            icon: 'fa-chart-line',
            name: "余弦飘带",
            children: [
                {
                    icon: 'fa-chart-line',
                    name: '余弦飘带',
                    click: function (group) {
                        addRibbon(group, "Math.cos(x)", 0, 2 * Math.PI);
                    }
                },
                {
                    icon: 'fa-chart-line',
                    name: '大余弦飘带',
                    click: function (group) {
                        addRibbon(group, "2*Math.cos(x/2)", 0, 4 * Math.PI);
                    }
                }, {
                    icon: 'fa-chart-line',
                    name: '窄余弦飘带',
                    click: function (group) {
                        addRibbon(group, "2*Math.cos(x)", 0, 2 * Math.PI);
                    }
                }, {
                    icon: 'fa-chart-line',
                    name: '缓余弦飘带',
                    click: function (group) {
                        addRibbon(group, "Math.cos(x/2)", 0, 4 * Math.PI);
                    }
                }
            ]
        }, {
            icon: 'fa-chart-line',
            name: "指数函数飘带",
            children: [
                {
                    icon: 'fa-chart-line',
                    name: '平方',
                    click: function (group) {
                        addRibbon(group, "x**2", -3, 3);
                    }
                },
                {
                    icon: 'fa-chart-line',
                    name: '缓平方',
                    click: function (group) {
                        addRibbon(group, "(x/2)**2", -6, 6);
                    }
                }, {
                    icon: 'fa-chart-line',
                    name: '开方',
                    click: function (group) {
                        addRibbon(group, "x**(1/2)", 0, 9);
                    }
                }, {
                    icon: 'fa-chart-line',
                    name: '缓开方',
                    click: function (group) {
                        addRibbon(group, "2*x**(1/2)", 0, 9);
                    }
                }
            ]
        },
        {
            icon: 'fa-cogs',
            name: '自定义飘带',
            click: customRibbonMenu
        }
    ]
};


function customRibbonMenu(group) {
    new Dialog({
        title: "输入函数飘带参数",
        lines: [
            "函数表达式举例：<br>",
            "sin 函数：<font color='#ff7f50'>Math.sin(x)</font> ",
            "cos 函数：<font color='#ff7f50'>Math.cos(x)</font> ",
            "tan 函数：<font color='#ff7f50'>Math.tan(x)</font><br> ",
            "二次函数：<font color='#ff7f50'>x*x+2*x+1</font> ",
            "指数函数：<font color='#ff7f50'>x**(1/2)</font> ",
            "对数函数：<font color='#ff7f50'>Math.log(x)</font><br> "
        ],
        form: {
            func: {
                type: "input",
                label: "函数表达式",
                placeholder: "使用 JS 函数表达式，自变量为 x"
            },
            start: {
                type: "number",
                label: "起始 x 值",
                value: 0, min: -100, max: 100,
            },
            end: {
                type: "number",
                label: "终止 x 值",
                value: 5, min: -100, max: 100,
            },
            width: {
                type: "number",
                label: "飘带宽度",
                value: 5, min: 1, max: 50, step: 1
            }
        },
        onConfirm: function (formData) {
            // 检查函数是否为空
            if (isEmpty(formData.func)) {
                Blockbench.notification("函数为空", "请输入一个函数表达式！");
                return;
            }

            // 检查参数长度
            if (Math.abs(formData.start - formData.end) < 1) {
                Blockbench.notification("参数过近", "起始和终止坐标差值过小！");
                return;
            }

            // 检查表达式
            try {
                let a = customFunction(formData.start, formData.func);
                let b = customFunction(formData.end, formData.func);
                if (Math.abs(a) > 100 || Math.abs(b) > 100) {
                    Blockbench.notification("函数超限", "起始或终止坐标距离过远！");
                    return;
                }
            } catch (e) {
                cl(e);
                Blockbench.notification("表达式错误", "函数表达式计算出错，请检查其书写正确性！");
                return;
            }

            // 生成对应内容
            try {
                // 防止玩家写反起始和终点
                let start = Math.min(formData.start, formData.end);
                let end = Math.max(formData.start, formData.end);
                addRibbon(group, formData.func, start, end, formData.width);
            } catch (e) {
                Blockbench.notification("生成错误", "请检查函数表达式书写正确性！");
            } finally {
                this.hide();
            }
        }
    }).show();
}


function customFunction(x, func) {
    return eval(`let x = ${x}; ${func};`);
}

function round(x, y) {
    return Math.sqrt(x ** 2 + y ** 2)
}

function addRibbon(rootGroup, func, start, end, width) {
    let startPos = [start, customFunction(start, func)];
    Undo.initEdit({outliner: true, elements: [], selection: true});
    let cubesBefore = elements.length;
    if (!rootGroup) {
        rootGroup = addRibbonGroup(undefined, [0, 0, 0], [0, 0, 0]);
    }
    genNodeGroup(rootGroup, func, startPos, end, width);
    Undo.finishEdit('add_ribbon_bone', {
        outliner: true,
        elements: elements.slice().slice(cubesBefore),
        selection: true
    });
    rootGroup.select();
    Canvas.updateSelected();
}

function genNodeGroup(rootGroup, func, startPos, end, width) {
    let next = intersection(startPos[0], startPos[0] + 1, startPos, func);
    let deg = Math.radToDeg(Math.atan((next[1] - startPos[1]) / (next[0] - startPos[0])));
    let group = addRibbonGroup(rootGroup, [startPos[0], startPos[1], 0], [0, 0, deg]);
    addRibbonCube(group, [startPos[0], startPos[1], 0], [1, 0, width]);
    if (next[0] <= end) {
        genNodeGroup(rootGroup, func, next, end, width);
    }
}

/**
 * 二分法查找交点
 */
function intersection(x1, x2, origin, func) {
    let middleX = (x1 + x2) / 2;
    let middleY = customFunction(middleX, func);
    let distance = round(middleX - origin[0], middleY - origin[1]) - 1;
    if (distance > 0.0005) {
        return intersection(x1, middleX, origin, func);
    } else if (distance < -0.0005) {
        return intersection(middleX, x2, origin, func);
    } else {
        return [middleX, middleY];
    }
}

function addRibbonGroup(selectedGroup, pivot, rotation) {
    let baseGroup = new Group({
        origin: [pivot[0], pivot[1], pivot[2]],
        rotation: [rotation[0], rotation[1], rotation[2]]
    });
    baseGroup.addTo(selectedGroup);
    baseGroup.createUniqueName();
    baseGroup.init();
    return baseGroup;
}

function addRibbonCube(selectedGroup, start, size) {
    // 方块构建
    let baseCube = new Cube({
        autouv: (settings.autouv.value ? 1 : 0)
    }).init();
    baseCube.addTo(selectedGroup);
    // 方块参数设置
    if (Format.bone_rig) {
        if (selectedGroup) {
            baseCube.extend({
                from: [start[0], start[1], start[2]],
                to: [start[0] + size[0], start[1] + size[1], start[2] + size[2]],
                origin: selectedGroup.origin.slice()
            });
        }
    }
}

var addPolygonMenu = {
    is_tlm_add_menu: true,
    icon: 'fa-draw-polygon',
    name: '生成多边形',
    condition: {modes: ['edit'], method: () => (Format.id === "bedrock_old")},
    children: [
        {
            icon: 'fa-draw-polygon',
            name: '正三边形',
            click: function (group) {
                let data = {
                    count: 3, width: 2, flip: 0
                };
                genPolygon(data, group);
            }
        }, {
            icon: 'fa-draw-polygon',
            name: '正五边形',
            click: function (group) {
                let data = {
                    count: 5, width: 2, flip: 0
                };
                genPolygon(data, group);
            }
        }, {
            icon: 'fa-draw-polygon',
            name: '正六边形',
            click: function (group) {
                let data = {
                    count: 6, width: 2, flip: 0
                };
                genPolygon(data, group);
            }
        }, {
            icon: 'fa-draw-polygon',
            name: '正八边形',
            click: function (group) {
                let data = {
                    count: 8, width: 2, flip: 0
                };
                genPolygon(data, group);
            }
        }, {
            icon: 'fa-draw-polygon',
            name: '十六边形',
            click: function (group) {
                let data = {
                    count: 16, width: 1, flip: 0
                };
                genPolygon(data, group);
            }
        }, {
            icon: 'fa-cogs',
            name: '自定义正多边形',
            click: function (group) {
                addPolygon(group);
            }
        }
    ]
};

function addPolygon(rootGroup) {
    new Dialog({
        title: "输入多边形参数",
        form: {
            count: {
                type: "number",
                label: "边数",
                value: 6, min: 3, max: 50, step: 1
            },
            width: {
                type: "number",
                label: "边长",
                value: 2, min: 1, max: 16, step: 1
            },
            flip: {
                type: "number",
                label: "翻转角度",
                value: 0, min: -180, max: 180, step: 1
            }
        },
        onConfirm: function (formData) {
            genPolygon(formData, rootGroup);
            this.hide();
        }
    }).show();
}

function genPolygon(formData, rootGroup) {
    let count = formData.count;
    let width = formData.width;

    Undo.initEdit({outliner: true, elements: [], selection: true});
    let cubesBefore = elements.length;

    // 如果没有选择任何组，那就创建一个组
    if (!rootGroup) {
        rootGroup = new Group({});
        // 检查骨骼命名
        if (Format.bone_rig) {
            rootGroup.createUniqueName();
        }
        rootGroup.init();
    }

    // 创建裙子
    let selectedGroup = rootGroup;
    if (!selectedGroup && selectedGroup.length) {
        Blockbench.notification("当前所选组不正确", "请选择或创建一个空组");
        return;
    }
    for (let i = 0; i < count; i++) {
        let z = (width / 2) / Math.tan(Math.PI / count);
        let deg = 360 / count * i;
        selectedGroup = addPolygonGroup(selectedGroup, [0, 0, 0], [formData.flip, deg, 0]);
        addPolygonCube(selectedGroup, [-width / 2, 0, z], [width, 1, 0]);
        selectedGroup = rootGroup;
    }
    Undo.finishEdit('add_polygon_bone', {
        outliner: true,
        elements: elements.slice().slice(cubesBefore),
        selection: true
    });
    rootGroup.select();
    Canvas.updateSelected();
}

function addPolygonCube(selectedGroup, start, size) {
    // 方块构建
    let baseCube = new Cube({
        autouv: (settings.autouv.value ? 1 : 0)
    }).init();
    baseCube.addTo(selectedGroup);
    // 方块参数设置
    if (Format.bone_rig) {
        if (selectedGroup) {
            let originPos = selectedGroup.origin.slice();
            baseCube.extend({
                from: [start[0], start[1], start[2]],
                to: [start[0] + size[0], start[1] + size[1], start[2] + size[2]],
                origin: originPos.slice()
            });
        }
    }
}

function addPolygonGroup(selectedGroup, pivot, rotation) {
    let baseGroup = new Group({
        origin: [pivot[0], pivot[1], pivot[2]],
        rotation: [rotation[0], rotation[1], rotation[2]]
    });
    baseGroup.addTo(selectedGroup);
    // 检查骨骼命名
    if (Format.bone_rig) {
        baseGroup.createUniqueName();
    }
    baseGroup.init();
    return baseGroup;
}

var addSkirt2Menu = {
    is_tlm_add_menu: true,
    icon: 'fa-vector-square',
    name: '生成方裙',
    condition: {modes: ['edit'], method: () => (Format.id === "bedrock_old")},
    children: [
        {
            icon: 'fa-vector-square',
            name: '四方裙',
            click: function (group) {
                let formData = {
                    length: 5, deg: 10, number: 4, side: 2
                };
                genSkirt2(formData, group);
            }
        }, {
            icon: 'fa-vector-square',
            name: '六方裙',
            click: function (group) {
                let formData = {
                    length: 2, deg: 15, number: 6, side: 2
                };
                genSkirt2(formData, group);
            }
        }, {
            icon: 'fa-vector-square',
            name: '八方裙',
            click: function (group) {
                let formData = {
                    length: 1, deg: 18, number: 8, side: 2
                };
                genSkirt2(formData, group);
            }
        }, {
            icon: 'fa-cogs',
            name: '自定义方裙',
            click: function (group) {
                addSkirt2(group);
            }
        }
    ]
};

function addSkirt2(rootGroup) {
    new Dialog({
        title: "输入方裙参数",
        form: {
            length: {
                type: "number",
                label: "方裙长度",
                value: 6, min: 2, max: 64, step: 1
            },
            deg: {
                type: "number",
                label: "方裙倾角",
                value: 10, min: 0, max: 90, step: 1
            },
            number: {
                type: "number",
                label: "方裙边数",
                value: 6, min: 3, max: 64, step: 1
            },
            side: {
                type: "number",
                label: "衔接边宽度",
                value: 2, min: 1, max: 16, step: 1
            }
        },
        onConfirm: function (formData) {
            genSkirt2(formData, rootGroup);
            this.hide();
        }
    }).show();
}

function genSkirt2(formData, rootGroup) {
    let length = formData.length;
    let deg = formData.deg;
    let number = formData.number;
    let side = formData.side;

    Undo.initEdit({outliner: true, elements: [], selection: true});
    let cubesBefore = elements.length;

    // 如果没有选择任何组，那就创建一个组
    if (!rootGroup) {
        rootGroup = new Group({});
        // 检查骨骼命名
        if (Format.bone_rig) {
            rootGroup.createUniqueName();
        }
        rootGroup.init();
    }

    // 创建裙子
    let selectedGroup = rootGroup;
    if (!selectedGroup && selectedGroup.length) {
        Blockbench.notification("当前所选组不正确", "请选择或创建一个空组");
        return;
    }
    let y = 6;
    let beta = Math.atan(Math.sin(Math.degToRad(deg) * Math.tan(Math.PI / number)));
    for (let i = 0; i < number; i++) {
        let box1;
        selectedGroup = addSkirtGroup$1(selectedGroup, [0, 0, 0], [0, (360 / number) * i, 0]);
        selectedGroup = addSkirtGroup$1(selectedGroup, [0, 0, side * Math.cos(beta) + (length / 2)],
            [-deg, 0, 0]);
        addSkirtCube$1(selectedGroup, [-length / 2, -side * Math.sin(beta), (side * Math.cos(beta) + length / 2) / Math.tan(Math.PI / number)],
            [length, y, 0]);
        box1 = addSkirtGroup$1(selectedGroup, [length / 2, -side * Math.sin(beta), side * Math.cos(beta) + length / 2], [0, 0, Math.radToDeg(beta)]);
        addSkirtCube$1(box1, [length / 2, -side * Math.sin(beta), (side * Math.cos(beta) + length / 2) / Math.tan(Math.PI / number) - 0.001], [side, y, 0]);
        box1 = addSkirtGroup$1(selectedGroup, [-length / 2, -side * Math.sin(beta), side * Math.cos(beta) + length / 2], [0, 0, -Math.radToDeg(beta)]);
        addSkirtCube$1(box1, [-length / 2 - side, -side * Math.sin(beta), (side * Math.cos(beta) + length / 2) / Math.tan(Math.PI / number) + 0.001], [side, y, 0]);
        selectedGroup = rootGroup;
    }

    Undo.finishEdit('add_skirt2_bone', {
        outliner: true,
        elements: elements.slice().slice(cubesBefore),
        selection: true
    });

    rootGroup.select();
    Canvas.updateSelected();

}

function addSkirtCube$1(selectedGroup, start, size) {
    // 方块构建
    let baseCube = new Cube({
        autouv: (settings.autouv.value ? 1 : 0)
    }).init();
    baseCube.addTo(selectedGroup);
    // 方块参数设置
    if (Format.bone_rig) {
        if (selectedGroup) {
            let originPos = selectedGroup.origin.slice();
            baseCube.extend({
                from: [start[0], start[1], start[2]],
                to: [start[0] + size[0], start[1] + size[1], start[2] + size[2]],
                origin: originPos.slice()
            });
        }
    }
}

function addSkirtGroup$1(selectedGroup, pivot, rotation) {
    let baseGroup = new Group({
        origin: [pivot[0], pivot[1], pivot[2]],
        rotation: [rotation[0], rotation[1], rotation[2]]
    });
    baseGroup.addTo(selectedGroup);
    // 检查骨骼命名
    if (Format.bone_rig) {
        baseGroup.createUniqueName();
    }
    baseGroup.init();
    return baseGroup;
}

var IS_TLM_ARMOR_HIDE = false;

var armorTlmBone = ["helmet", "chestPlate", "chestPlateLeft", "chestPlateMiddle", "chestPlateRight",
    "leggings", "leggingsLeft", "leggingsMiddle", "leggingsRight",
    "bootsLeft", "bootsRight"];

var hideArmorTlmBone = ["-helmet", "_helmet", "-chestPlate", "-chestPlateLeft", "-chestPlateMiddle", "-chestPlateRight",
    "_chestPlate", "_chestPlateLeft", "_chestPlateMiddle", "_chestPlateRight",
    "-leggings", "-leggingsLeft", "-leggingsMiddle", "-leggingsRight", "_leggings",
    "_leggingsLeft", "_leggingsMiddle", "_leggingsRight",
    "-bootsLeft", "-bootsRight", "_bootsLeft", "_bootsRight"];

var hideArmor = new Action('tlm_hide_armor', {
    name: '切换护甲隐藏',
    description: '切换护甲隐藏',
    icon: 'visibility',
    category: 'edit',
    condition: () => (Format.id === 'bedrock_old'),
    click: function () {
        IS_TLM_ARMOR_HIDE = !IS_TLM_ARMOR_HIDE;
        if (IS_TLM_ARMOR_HIDE) {
            BarItems["tlm_hide_armor"].setIcon('visibility_off');
        } else {
            BarItems["tlm_hide_armor"].setIcon('visibility');
        }

        let armor = [];
        let hideArmor = [];

        Group.all.forEach(group => {
            if (armorTlmBone.includes(group.name)) {
                armor.push(group);
            }
            if (hideArmorTlmBone.includes(group.name)) {
                hideArmor.push(group);
            }
            if (group.name === "_helmet") {
                console.log(hideArmor);
            }
        });

        armor.forEach(group => {
            group.select();
            Cube.selected.forEach(cube => {
                cube.visibility = !IS_TLM_ARMOR_HIDE;
            });
        });
        hideArmor.forEach(group => {
            group.select();
            Cube.selected.forEach(cube => {
                cube.visibility = IS_TLM_ARMOR_HIDE;
            });
        });

        Canvas.updateVisibility();
    }
});

var rotateArray = new Action('rotation_array_tlm_delete', {
        icon: 'content_copy',
        category: 'edit',
        name: "旋转阵列",
        label: "用来旋转阵列模型",
        condition: () => (Modes.edit && (selected.length || Group.selected) && Format.id === "bedrock_old"),
        click: function () {
            rotationArrayDialog.show();
        }
    }
);

var rotationArrayDialog = new Dialog({
    id: "rotation_array_dialog",
    title: "旋转阵列",
    form: {
        count: {
            type: "number",
            label: "阵列个数",
            value: 5, min: 1, max: 31, step: 1
        },
        deg: {
            type: "number",
            label: "偏转角度",
            value: 60, min: 0, max: 360,
        },
        axis: {
            type: "select",
            label: "旋转轴",
            default: 0,
            options: {
                0: "X 轴",
                1: "Y 轴",
                2: "Z 轴"
            }
        }
    },
    onConfirm: function (formData) {
        let count = formData.count;
        let deg = formData.deg;
        let axis = formData.axis;

        if (Group.selected && (Group.selected.matchesSelection() || selected.length === 0)) {
            let startDeg = Group.selected.rotation[axis];
            let raw = Group.selected;

            Undo.initEdit({outliner: true, elements: [], selection: true});
            let cubesBefore = elements.length;
            for (let i = 1; i < count + 1; i++) {
                let g = raw.duplicate();
                g.rotation[axis] = Math.trimDeg(startDeg + i * deg);
            }
            Undo.finishEdit('rotation_array', {
                outliner: true,
                elements: elements.slice().slice(cubesBefore),
                selection: true
            });
        }

        Canvas.updateAll();
        rotationArrayDialog.hide();
    }
});

(function () {
    Plugin.register(tlmUtilsPackageJsonInfo.name, {
        title: '车万女仆模组插件',
        author: tlmUtilsPackageJsonInfo.author,
        description: '专门为车万女仆模组制作模型包所设计的插件。',
        about: `<hr>
        <p>感谢你使用 Blockbench 车万女仆模组插件 1.0.3 版本，此插件专为车万女仆模组制作资源包所设计，欢迎您反馈使用过程中的意见和建议。</p>
        <p>期望大家能够在创作自己喜爱的事物中，收获到更多的快乐。</p>
        <p>下附一首我很喜欢的一首名为《金木犀》的曲子：</p>
        <br>
        <p align="center">
        <iframe 
        frameborder="no" border="0" marginwidth="0" 
        marginheight="0" width=350 height=133 
        src="https://music.163.com/outchain/player?type=2&id=41554447&auto=0&height=133">
        </iframe>
        <p>
        <br>`,
        icon: 'card_membership',
        version: tlmUtilsPackageJsonInfo.version,
        variant: 'desktop',
        onload() {
            Language.data["menu.tlm_bar_menu"] = "车万女仆";
            // 添加主菜单
            new BarMenu("tlm_bar_menu", [
                'create_default_maid_model',
                '_',
                'create_new_pack',
                'export_pack',
                'load_pack',
                '_',
                {
                    name: '帮助',
                    id: 'tlm_help',
                    icon: 'help',
                    children: [
                        'open_wiki_url',
                        'open_mcbbs_url'
                    ]
                }
            ]);
            MenuBar.update();
            registerTextureEvent();
            Group.prototype.menu.structure.push('_');
            Group.prototype.menu.structure.push(rotateArray);
            Group.prototype.menu.structure.push('_');
            Group.prototype.menu.structure.push(addSkirtMenu);
            Group.prototype.menu.structure.push(addSkirt2Menu);
            Group.prototype.menu.structure.push(addRibbonMenu);
            Group.prototype.menu.structure.push(addPolygonMenu);
            Group.prototype.menu.structure.push(addBoneMenu);

            Interface.Panels.outliner.menu.structure.push('_');
            Interface.Panels.outliner.menu.structure.push(addSkirtMenu);
            Interface.Panels.outliner.menu.structure.push(addSkirt2Menu);
            Interface.Panels.outliner.menu.structure.push(addRibbonMenu);
            Interface.Panels.outliner.menu.structure.push(addPolygonMenu);
            Interface.Panels.outliner.menu.structure.push(addBoneMenu);

            Toolbars.outliner.add(hideArmor, -1);
        },
        onunload() {
            // 删除主菜单按钮
            delete MenuBar.menues["tlm_bar_menu"];
            MenuBar.update();
            removeTextureEvent();

            // 删除子菜单按钮
            createNewPack.delete();
            exportPack.delete();
            loadPack.delete();
            createDefaultMaidModel.delete();
            openWikiUrl.delete();
            openMcbbsUrl.delete();
            hideArmor.delete();
            rotateArray.delete();

            function deleteMenu(structure) {
                for (let i = 0; i < structure.length; i++) {
                    if (structure[i] && (structure[i]["is_tlm_add_menu"] || (structure[i].id && structure[i].id.endsWith("tlm_delete")))) {
                        delete structure[i];
                    }
                }
            }

            // 删除所有本插件添加的菜单
            deleteMenu(Group.prototype.menu.structure);
            deleteMenu(Interface.Panels.outliner.menu.structure);
        }
    });
})();
