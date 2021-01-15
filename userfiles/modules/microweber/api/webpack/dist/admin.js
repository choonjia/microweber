/******/ (() => { // webpackBootstrap
(() => {
/*!**************************!*\
  !*** ../system/color.js ***!
  \**************************/
mw.color = {
  rgbToHex : function(color) {
    if(typeof color == 'object'){
      color = color.r + ',' + color.g + ',' + color.b;
    }
    if(color.contains('rgb')){
      color = color.replace(/rgba/g, '').replace(/rgb/g, '').replace(/\(|\)/g, "").replace(/\s/g, "");
    }
    color = color.split(',');
    if(color !== 'transparent'){
      return "#" + ((1 << 24) + (parseInt(color[0]) << 16) + (parseInt(color[1]) << 8) + parseInt(color[2])).toString(16).slice(1);
    }
    else{
      return 'transparent';
    }
  },
  hexToRgb: function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  },
  colorParse:function(CSScolor){
    CSScolor = CSScolor || 'rgb(0,0,0,0)';
    var final = {r:0,g:0,b:0,alpha:0};
    if(CSScolor.contains('rgb')){
      var parse = CSScolor.replace(/rgba/g, '').replace(/rgb/g, '').replace(/\(|\)/g, "").replace(/\s/g, "").split(',');
      final.r = parseInt(parse[0], 10);
      final.g = parseInt(parse[1], 10);
      final.b = parseInt(parse[2], 10);
      final.alpha = Number((parse[3]||1));
      return final;
    }
    else{
      final = mw.color.hexToRgb(CSScolor);
      final.alpha = 1
      return final;
    }
  },
  getBrightness: function(color) {
      var rgb = this.colorParse(color);
      return {
          color: (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000,
          alpha: rgb.alpha * 100
      };
  },
  isDark: function(color) {
      var brightness = this.getBrightness(color);
      return brightness.color < 128 && brightness.alpha > 22;
  },
  isLight: function(color) {
      return !this.isDark(color);
  },
  hexToRgbaCSS: function(hex, alpha) {
    alpha = alpha || 1;
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? ('rgba('+parseInt(result[1], 16)+','+parseInt(result[2], 16)+','+parseInt(result[3], 16)+','+alpha+')') : '';
  },
  random: function(){
    return '#' + Math.floor( Math.random() * 16777215 ).toString(16);
  },
  decimalToHex: function(decimal){
    var hex = decimal.toString(16);
    if (hex.length == 1) hex = '0' + hex;
    return hex;
  },
  hexToDecimal: function(hex){
    return parseInt(hex,16);
  },
  oppositeColor: function(color) {
    color = !color.contains("#") ? color : color.replace("#", '');
    return mw.color.decimalToHex(255 - mw.color.hexToDecimal(color.substr(0,2)))
      + mw.color.decimalToHex(255 - mw.color.hexToDecimal(color.substr(2,2)))
      + mw.color.decimalToHex(255 - mw.color.hexToDecimal(color.substr(4,2)));
  }
}

















})();

(() => {
/*!*******************************!*\
  !*** ../system/css_parser.js ***!
  \*******************************/




mw.CSSParser = function(el){
    if(!el || !el.nodeName) return false;
    if(el.nodeName === '#text') return false;


    try {
        var css = window.getComputedStyle(el, null);
    } catch(error) {
        return;
    }


    var f = {};

    f.display = function(){
      return css.display;
    };

    f.is = function(){
        return {
          bold: parseFloat(css.fontWeight)>600 || css.fontWeight === 'bold' || css.fontWeight === 'bolder',
          italic: css.fontStyle === 'italic'||css.fontStyle === 'oblique',
          underlined: css.textDecoration === 'underline',
          striked: css.textDecoration.indexOf('line-through') === 0,
        };
    };
    f.font = function(){
      if(css === null) return false;
      return {
        size:css.fontSize,
        weight:css.fontWeight,
        style:css.fontStyle,
        height:css.lineHeight,
        family:css.fontFamily,
        color:css.color
      };
    }
    f.alignNormalize = function(){
        if(!!css){
        var a = css.textAlign;
        var final = a.contains('left')?'left':a.contains('center')?'center':a.contains('justify')?'justify':a.contains('right')?'right':'left';
        return final;
      }
    }
    f.border = function(parse){
        if(!parse){
          return {
              top:{width:css.borderTopWidth, style:css.borderTopStyle, color:css.borderTopColor},
              left:{width:css.borderLeftWidth, style:css.borderLeftStyle, color:css.borderLeftColor},
              right:{width:css.borderRightWidth, style:css.borderRightStyle, color:css.borderRightColor},
              bottom:{width:css.borderBottomWidth, style:css.borderBottomStyle, color:css.borderBottomColor}
          }
        }
        else{
          return {
              top:{width:parseFloat(css.borderTopWidth), style:css.borderTopStyle, color:css.borderTopColor},
              left:{width:parseFloat(css.borderLeftWidth), style:css.borderLeftStyle, color:css.borderLeftColor},
              right:{width:parseFloat(css.borderRightWidth), style:css.borderRightStyle, color:css.borderRightColor},
              bottom:{width:parseFloat(css.borderBottomWidth), style:css.borderBottomStyle, color:css.borderBottomColor}
          }
        }

    }
    f.width = function(){
        return css.width;
    }
    f.position = function(){
        return css.position;
    }
    f.background = function(){
        return {
            image:css.backgroundImage,
            color:css.backgroundColor,
            position:css.backgroundPosition,
            repeat:css.backgroundRepeat
        }
    }
    f.margin = function(parse, actual){
        if(actual){
            var _parent = el.parentNode;
            var parentOff = mw.$(_parent).offset();
            var elOff = mw.$(el).offset();
            if(elOff.left > parentOff.left && css.marginLeft === css.marginRight && elOff.left - parentOff.left === parseInt(css.marginLeft, 10)){
                return {
                    top:css.marginTop,
                    left:'auto',
                    right:'auto',
                    bottom:css.marginBottom
                };
            }
      }
      if(!parse){
        return {
          top:css.marginTop,
          left:css.marginLeft,
          right:css.marginRight,
          bottom:css.marginBottom
        }
      }
      else{
        return {
          top:parseFloat(css.marginTop),
          left:parseFloat(css.marginLeft),
          right:parseFloat(css.marginRight),
          bottom:parseFloat(css.marginBottom)
        }
      }
    }
    f.padding = function(parse){
      if(!parse){
        return {
          top:css.paddingTop,
          left:css.paddingLeft,
          right:css.paddingRight,
          bottom:css.paddingBottom
        }
      }
      else{
         return {
          top:parseFloat(css.paddingTop),
          left:parseFloat(css.paddingLeft),
          right:parseFloat(css.paddingRight),
          bottom:parseFloat(css.paddingBottom)
        }
      }
    }
    f.opacity = function(){return css.opacity}

    f.radius = function(parse){
      if(!parse){
        return {
          tl:css.borderTopLeftRadius,
          tr:css.borderTopRightRadius,
          br:css.borderBottomRightRadius,
          bl:css.borderBottomLeftRadius
        }
      }
      else{
        return {
          tl:parseFloat(css.borderTopLeftRadius),
          tr:parseFloat(css.borderTopRightRadius),
          br:parseFloat(css.borderBottomRightRadius),
          bl:parseFloat(css.borderBottomLeftRadius)
        }
      }
    }

    f.transform = function(){
     var transform = mw.JSPrefix('transform');
     var transform = css[transform];
     if(transform==="" || transform==="none"){
       return [1, 0, 0, 1, 0, 0];
     }
     else{
       var transform = transform.substr(7, transform.length - 8).split(", ");
       return transform;
     }
    }

    f.shadow = function(){
      var shadow =  mw.JSPrefix('boxShadow');
      var shadow = css[shadow].replace(/, /g, ",").split(" ");
      return {
        color: shadow[0],
        left:shadow[1],
        top:shadow[2],
        strength:shadow[3]
      }
    }

    return {
        el:el,
        css:css,
        get:f
    }
}



})();

(() => {
/*!*******************************!*\
  !*** ../system/filepicker.js ***!
  \*******************************/

mw.require('uploader.js');


mw.filePicker = function (options) {
    options = options || {};
    var scope = this;
    var $scope = $(this);
    var defaults = {
        components: [
            {type: 'desktop', label: mw.lang('My computer')},
            {type: 'url', label: mw.lang('URL')},
            {type: 'server', label: mw.lang('Uploaded')},
            {type: 'library', label: mw.lang('Media library')}
        ],
        nav: 'tabs', // 'tabs | 'dropdown',
        hideHeader: false,
        dropDownTargetMode: 'self', // 'self', 'dialog'
        element: null,
        footer: true,
        okLabel: mw.lang('OK'),
        cancelLabel: mw.lang('Cancel'),
        uploaderType: 'big', // 'big' | 'small'
        confirm: function (data) {

        },
        cancel: function () {

        },
        label: mw.lang('Media'),
        autoSelect: true, // depending on the component
        boxed: false,
        multiple: false
    };



    this.settings = $.extend(true, {}, defaults, options);

    this.$root = $('<div class="'+ (this.settings.boxed ? ('card mb-3') : '') +' mw-filepicker-root"></div>');
    this.root = this.$root[0];

    $.each(this.settings.components, function (i) {
        this['index'] = i;
    });


    this.components = {
        _$inputWrapper: function (label) {
            var html = '<div class="mw-ui-field-holder">' +
                /*'<label>' + label + '</label>' +*/
                '</div>';
            return mw.$(html);
        },
        url: function () {
            var $input = $('<input class="mw-ui-field w100" placeholder="http://example.com/image.jpg">');
            scope.$urlInput = $input;
            var $wrap = this._$inputWrapper(scope._getComponentObject('url').label);
            $wrap.append($input);
            $input.before('<label class="mw-ui-label">Insert file url</label>');
            $input.on('input', function () {
                var val = this.value.trim();
                scope.setSectionValue(val || null);
                if(scope.settings.autoSelect) {

                    scope.result();
                }
            });
            return $wrap[0];
        },
        _setdesktopType: function () {
            var $zone;
            if(scope.settings.uploaderType === 'big') {
                $zone = $('<div class="mw-file-drop-zone">' +
                    '<div class="mw-file-drop-zone-holder">' +
                    '<div class="mw-file-drop-zone-img"></div>' +
                    '<div class="mw-ui-progress-small"><div class="mw-ui-progress-bar" style="width: 0%"></div></div>' +
                    '<span class="mw-ui-btn mw-ui-btn-rounded mw-ui-btn-info">'+mw.lang('Add file')+'</span> ' +
                    '<p>'+mw.lang('or drop files to upload')+'</p>' +
                    '</div>' +
                    '</div>');
            } else if(scope.settings.uploaderType === 'small') {
                $zone = $('<div class="mw-file-drop-zone mw-file-drop-zone-small mw-file-drop-square-zone"> <div class="mw-file-drop-zone-holder"> <span class="mw-ui-link">Add file</span> <p>or drop file to upload</p> </div> </div>')
            }


            var $el = $(scope.settings.element).eq(0);
            $el.removeClass('mw-filepicker-desktop-type-big mw-filepicker-desktop-type-small');
            $el.addClass('mw-filepicker-desktop-type-' + scope.settings.uploaderType);
            scope.uploaderHolder.empty().append($zone);
        },
        desktop: function () {
            var $wrap = this._$inputWrapper(scope._getComponentObject('desktop').label);
            scope.uploaderHolder = mw.$('<div class="mw-uploader-type-holder"></div>');
            this._setdesktopType();
            $wrap.append(scope.uploaderHolder);
            scope.uploader = mw.upload({
                element: $wrap[0],
                multiple: scope.settings.multiple,
                accept: scope.settings.accept,
                on: {
                    progress: function (prg) {
                        scope.uploaderHolder.find('.mw-ui-progress-bar').stop().animate({width: prg.percent + '%'}, 'fast');
                    },
                    fileUploadError: function (file) {
                         $(scope).trigger('FileUploadError', [file]);
                    },
                    fileAdded: function (file) {
                        $(scope).trigger('FileAdded', [file]);
                        scope.uploaderHolder.find('.mw-ui-progress-bar').width('1%');
                    },
                    fileUploaded: function (file) {
                        scope.setSectionValue(file);

                        $(scope).trigger('FileUploaded', [file]);
                        if (scope.settings.autoSelect) {
                            scope.result();
                        }
                        if (scope.settings.fileUploaded) {
                            scope.settings.fileUploaded(file);
                        }
                        if (!scope.settings.multiple) {
                            mw.notification.success('File uploaded');
                            scope.uploaderHolder.find('.mw-file-drop-zone-img').css('backgroundImage', 'url('+file.src+')');
                        }
                        // scope.uploaderHolder.find('.mw-file-drop-zone-img').css('backgroundImage', 'url('+file.src+')');
                    }
                }
            });
            return $wrap[0];
        },
        server: function () {
            var $wrap = this._$inputWrapper(scope._getComponentObject('server').label);
            /*mw.load_module('files/admin', $wrap, function () {

            }, {'filetype':'images'});*/

            $(scope).on('$firstOpen', function (e, el, type) {
                var comp = scope._getComponentObject('server');
                if (type === 'server') {
                    mw.tools.loading(el, true);
                    var fr = mw.tools.moduleFrame('files/admin', {'filetype':'images'});
                    if(scope.settings._frameMaxHeight) {
                        fr.style.maxHeight = '60vh';
                        fr.scrolling = 'yes';
                    }
                    $wrap.append(fr);
                    fr.onload = function () {
                        mw.tools.loading(el, false);
                        this.contentWindow.$(this.contentWindow.document.body).on('click', '.mw-browser-list-file', function () {
                            var url = this.href;
                            scope.setSectionValue(url);
                            if (scope.settings.autoSelect) {
                                scope.result();
                            }
                        });
                    };
                }
            });

            return $wrap[0];
        },
        library: function () {
            var $wrap = this._$inputWrapper(scope._getComponentObject('library').label);
            $(scope).on('$firstOpen', function (e, el, type) {
                var comp = scope._getComponentObject('library');
                if (type === 'library') {
                    mw.tools.loading(el, true);
                    var fr = mw.top().tools.moduleFrame('pictures/media_library');
                    $wrap.append(fr);
                    if(scope.settings._frameMaxHeight) {
                        fr.style.maxHeight = '60vh';
                        fr.scrolling = 'yes';
                    }
                    fr.onload = function () {
                        mw.tools.loading(el, false);
                        this.contentWindow.mw.on.hashParam('select-file', function () {
                            var url = this.toString();
                            scope.setSectionValue(url);
                            if (scope.settings.autoSelect) {
                                scope.result();
                            }
                        });
                    };
                }
            })

            /*mw.load_module('pictures/media_library', $wrap);*/
            return $wrap[0];
        }
    };

    this.hideUploaders = function (type) {
        mw.$('.mw-filepicker-component-section', this.$root).hide();
    };

    this.showUploaders = function (type) {
        mw.$('.mw-filepicker-component-section', this.$root).show();
    };

    this.desktopUploaderType = function (type) {
        if(!type) return this.settings.uploaderType;
        this.settings.uploaderType = type;
        this.components._setdesktopType();
    };

    this.settings.components = this.settings.components.filter(function (item) {
        return !!scope.components[item.type];
    });


    this._navigation = null;
    this.__navigation_first = [];

    this.navigation = function () {
        this._navigationHeader = document.createElement('div');
        this._navigationHeader.className = 'mw-filepicker-component-navigation-header ' + (this.settings.boxed ? 'card-header no-border' : '');
        if (this.settings.hideHeader) {
            this._navigationHeader.style.display = 'none';
        }
        if (this.settings.label) {
            this._navigationHeader.innerHTML = '<h6><strong>' + this.settings.label + '</strong></h6>';
        }
        this._navigationHolder = document.createElement('div');
        if(this.settings.nav === false) {

        }
        else if(this.settings.nav === 'tabs') {
            var ul = $('<nav class="mw-ac-editor-nav" />');
            this.settings.components.forEach(function (item) {
                ul.append('<a href="javascript:;" class="mw-ui-btn-tab" data-type="'+item.type+'">'+item.label+'</a>');
            });
            this._navigationHolder.appendChild(this._navigationHeader);
            this._navigationHeader.appendChild(ul[0]);
            setTimeout(function () {
                scope._tabs = mw.tabs({
                    nav: $('a', ul),
                    tabs: $('.mw-filepicker-component-section', scope.$root),
                    activeClass: 'active',
                    onclick: function (el, event, i) {
                        if(scope.__navigation_first.indexOf(i) === -1) {
                            scope.__navigation_first.push(i);
                            $(scope).trigger('$firstOpen', [el, this.dataset.type]);
                        }
                        scope.manageActiveSectionState();
                    }
                });
            }, 78);
        } else if(this.settings.nav === 'dropdown') {
            var select = $('<select class="selectpicker btn-as-link" data-style="btn-sm" data-width="auto" data-title="' + mw.lang('Add file') + '"/>');
            scope._select = select;
            this.settings.components.forEach(function (item) {
                select.append('<option class="nav-item" value="'+item.type+'">'+item.label+'</option>');
            });

            this._navigationHolder.appendChild(this._navigationHeader);
            this._navigationHeader.appendChild(select[0]);
            select.on('changed.bs.select', function (e, xval) {
                var val = select.selectpicker('val');
                var componentObject = scope._getComponentObject(val) ;
                var index = scope.settings.components.indexOf(componentObject);
                var items = $('.mw-filepicker-component-section', scope.$root);
                if(scope.__navigation_first.indexOf(val) === -1) {
                    scope.__navigation_first.push(val);
                    $(scope).trigger('$firstOpen', [items.eq(index)[0], val]);
                }
                if(scope.settings.dropDownTargetMode === 'dialog') {
                    var temp = document.createElement('div');
                    var item = items.eq(index);
                    item.before(temp);
                    item.show();
                    var footer = false;
                    if (scope._getComponentObject('url').index === index ) {
                        footer =  document.createElement('div');
                        var footerok = $('<button type="button" class="mw-ui-btn mw-ui-btn-info">' + scope.settings.okLabel + '</button>');
                        var footercancel = $('<button type="button" class="mw-ui-btn">' + scope.settings.cancelLabel + '</button>');
                        footerok.disabled = true;
                        footer.appendChild(footercancel[0]);
                        footer.appendChild(footerok[0]);
                        footer.appendChild(footercancel[0]);
                        footercancel.on('click', function () {
                            scope.__pickDialog.remove();
                        });
                        footerok.on('click', function () {
                            scope.setSectionValue(scope.$urlInput.val().trim() || null);
                            if (scope.settings.autoSelect) {
                                scope.result();
                            }
                            // scope.__pickDialog.remove();
                        });
                    }

                    scope.__pickDialog = mw.top().dialog({
                        overlay: true,
                        content: item,
                        beforeRemove: function () {
                            $(temp).replaceWith(item);
                            item.hide();
                            scope.__pickDialog = null;
                        },
                        footer: footer
                    });
                } else {
                    items.hide().eq(index).show();
                }
            });
        }
        this.$root.prepend(this._navigationHolder);

    };
    this.__displayControllerByTypeTime = null;

    this.displayControllerByType = function (type) {
        type = (type || '').trim();
        var item = this._getComponentObject(type) ;
        clearTimeout(this.__displayControllerByTypeTime);
        this.__displayControllerByTypeTime = setTimeout(function () {
            if(scope.settings.nav === 'tabs') {
                mw.$('[data-type="'+type+'"]', scope.$root).click();
            } else if(scope.settings.nav === 'dropdown') {
                $(scope._select).selectpicker('val', type);
            }
        }, 10);
    };



    this.footer = function () {
        if(!this.settings.footer || this.settings.autoSelect) return;
        this._navigationFooter = document.createElement('div');
        this._navigationFooter.className = 'mw-ui-form-controllers-footer mw-filepicker-footer ' + (this.settings.boxed ? 'card-footer' : '');
        this.$ok = $('<button type="button" class="mw-ui-btn mw-ui-btn-info">' + this.settings.okLabel + '</button>');
        this.$cancel = $('<button type="button" class="mw-ui-btn ">' + this.settings.cancelLabel + '</button>');
        this._navigationFooter.appendChild(this.$cancel[0]);
        this._navigationFooter.appendChild(this.$ok[0]);
        this.$root.append(this._navigationFooter);
        this.$ok[0].disabled = true;
        this.$ok.on('click', function () {
            scope.result();
        });
        this.$cancel.on('click', function () {
            scope.settings.cancel()
        });
    };

    this.result = function () {
        var activeSection = this.activeSection();
        if(this.settings.onResult) {
            this.settings.onResult.call(this, activeSection._filePickerValue);
        }
         $(scope).trigger('Result', [activeSection._filePickerValue]);
    };

    this.getValue = function () {
        return this.activeSection()._filePickerValue;
    };

    this._getComponentObject = function (type) {
        return this.settings.components.find(function (comp) {
            return comp.type && comp.type === type;
        });
    };

    this._sections = [];
    this.buildComponentSection = function () {
        var main = mw.$('<div class="'+(this.settings.boxed ? 'card-body' : '') +' mw-filepicker-component-section"></div>');
        this.$root.append(main);
        this._sections.push(main[0]);
        return main;
    };

    this.buildComponent = function (component) {
        if(this.components[component.type]) {
            return this.components[component.type]();
        }
    };

    this.buildComponents = function () {
        $.each(this.settings.components, function () {
            var component = scope.buildComponent(this);
            if(component){
                var sec = scope.buildComponentSection();
                sec.append(component);
            }
        });
    };

    this.build = function () {
        this.navigation();
        this.buildComponents();
        if(this.settings.nav === 'dropdown') {
            $('.mw-filepicker-component-section', scope.$root).hide().eq(0).show();
        }
        this.footer();
    };

    this.init = function () {
        this.build();
        if (this.settings.element) {
            $(this.settings.element).eq(0).append(this.$root);
        }
        if($.fn.selectpicker) {
            $('select', scope.$root).selectpicker();
        }
    };

    this.hide = function () {
        this.$root.hide();
    };
    this.show = function () {
        this.$root.show();
    };

    this.activeSection = function () {
        return $(this._sections).filter(function (){
            return $(this).css('display') !== 'none';
        })[0];
    };

    this.setSectionValue = function (val) {
         var activeSection = this.activeSection();
         if(activeSection) {
            activeSection._filePickerValue = val;
        }

        if(scope.__pickDialog) {
            scope.__pickDialog.remove();
        }
        this.manageActiveSectionState();
    };
    this.manageActiveSectionState = function () {
        // if user provides value for more than one section, the active value will be the one in the current section
        var activeSection = this.activeSection();
        if (this.$ok && this.$ok[0]) {
            this.$ok[0].disabled = !(activeSection && activeSection._filePickerValue);
        }
    };

    this.init();
};

})();

(() => {
/*!**********************************!*\
  !*** ../system/icon_selector.js ***!
  \**********************************/


(function () {

    var IconLoader = function (store) {
        var scope = this;

        var defaultVersion = '-1';

        var iconsCache = {};


        var common = {
            'fontAwesome': {
                cssSelector: '.fa',
                detect: function (target) {
                    return target.classList.contains('fa');
                },
                render: function (icon, target) {
                    target.classList.add('fa');
                    target.classList.add(icon);
                },
                remove: function (target) {
                    target.classList.remove('fa');
                    var exception= ['fa-lg', 'fa-2x', 'fa-3x', 'fa-4x', 'fa-5x', 'fa-fw', 'fa-spin', 'fa-pule', 'fa-rotate-90',
                        'fa-rotate-180', 'fa-rotate-270', 'fa-flip-horizontal', 'fa-flip-vertical'];
                    mw.tools.classNamespaceDelete(target, 'fa-', undefined, undefined, exception);
                },
                icons: function () {
                     return new Promise(function (resolve) {
                         $.get(mw.settings.modules_url + 'microweber/api/fa.icons.js',function (data) {
                             resolve(JSON.parse(data));
                        });
                    });
                },
                name: 'Font Awesome',
                load:  mw.settings.libs_url + 'fontawesome-4.7.0' + '/css/font-awesome.min.css',
                unload: function () {
                    document.querySelector('link[href*="fontawesome-4.7.0"]').remove();
                },
                version: '4.7.0'
            },
            'materialIcons': {
                cssSelector: '.material-icons',
                detect: function (target) {
                    return target.classList.contains('material-icons');
                },
                render: function (icon, target) {
                    target.classList.add('material-icons');
                    target.innerHTML = (icon);
                },
                remove: function (target) {
                    mw.tools.removeClass(target, 'material-icons');
                    target.innerHTML = '';
                 },
                icons: function () {
                    return new Promise(function (resolve) {
                        $.get(mw.settings.modules_url + 'microweber/api/material.icons.js',function (data) {
                            resolve(JSON.parse(data));
                        });
                    });
                },
                name: 'Material Icons',
                load: mw.settings.libs_url + 'material_icons' + '/material_icons.css',
                unload: function () {
                    top.document.querySelector('link[href*="material_icons.css"]').remove();
                },
                version: 'mw'
            },
            'iconsMindLine': {
                cssSelector: '[class*="mw-micon-"]:not([class*="mw-micon-solid-"])',
                detect: function (target) {
                    return target.className.includes('mw-micon-') && !target.className.includes('mw-micon-solid-');
                },
                render: function (icon, target) {
                    target.classList.add(icon);
                },
                remove: function (target) {
                    mw.tools.classNamespaceDelete(target, 'mw-micon-', undefined, undefined, []);
                },
                icons: function () {
                    var scope = this;
                    var parse = function (cssLink) {
                        var icons = cssLink.sheet.cssRules;
                        var l = icons.length, i = 0, mindIcons = [];
                        for (; i < l; i++) {
                            var sel = icons[i].selectorText;
                            if (!!sel && sel.indexOf('.mw-micon-') === 0) {
                                var cls = sel.replace(".", '').split(':')[0];
                                mindIcons.push(cls);
                            }
                        }
                    };
                    var load = function (cb) {
                        var cssLink = mw.top().win.document.querySelector('link[href*="mw-icons-mind/line"]');
                        if(cssLink) {
                            cb.call(undefined, cssLink);
                        }  else {
                            $.get(scope.load, function (data) {
                                cssLink = document.createElement('link');
                                cssLink.type = 'text/css';
                                cssLink.rel = 'stylesheet';
                                cssLink.href = scope.load;
                                $(document.head).append(cssLink);
                                cb.call(undefined, cssLink);
                            });
                        }
                    };
                    return new Promise(function (resolve) {
                        load(function (link) {
                            resolve(parse(link));
                        });
                    });
                },
                name: 'Icons Mind Line',
                load:  mw.settings.modules_url + 'microweber/api/libs/mw-icons-mind/line/style.css',
                unload: function () {
                    document.querySelector('link[href*="mw-icons-mind/line/style"]').remove();
                },
                version: 'mw_local'
            },
            'iconsMindSolid': {
                cssSelector: '[class*="mw-micon-solid-"]',
                detect: function (target) {
                    return target.className.includes('mw-micon-solid-');
                },
                render: function (icon, target) {
                    target.classList.add(icon);
                },
                remove: function (target) {
                    mw.tools.classNamespaceDelete(target, 'mw-micon-solid-', undefined, undefined, []);
                },
                icons: function () {
                    var scope = this;
                    var parse = function (cssLink) {
                        var icons = cssLink.sheet.cssRules;
                        var l = icons.length, i = 0, mindIcons = [];
                        for (; i < l; i++) {
                            var sel = icons[i].selectorText;
                            if (!!sel && sel.indexOf('.mw-micon-solid-') === 0) {
                                var cls = sel.replace(".", '').split(':')[0];
                                mindIcons.push(cls);
                            }
                        }
                    };
                    var load = function (cb) {
                        var cssLink = mw.top().win.document.querySelector('link[href*="mw-icons-mind/solid"]');
                        if(cssLink) {
                            cb.call(undefined, cssLink);
                        }  else {
                            $.get(scope.load, function (data) {
                                cssLink = document.createElement('link');
                                cssLink.type = 'text/css';
                                cssLink.rel = 'stylesheet';
                                cssLink.href = scope.load;
                                $(document.head).append(cssLink);
                                cb.call(undefined, cssLink);
                            });
                        }
                    };
                    return new Promise(function (resolve) {
                        load(function (link) {
                            resolve(parse(link));
                        });
                    });
                },
                name: 'Icons Mind Solid',
                load:  mw.settings.modules_url + 'microweber/api/libs/mw-icons-mind/solid/style.css',
                unload: function () {
                    document.querySelector('link[href*="mw-icons-mind/solid/style"]').remove();
                },
                version: 'mw_local'
            },

            'materialDesignIcons': {
                cssSelector: '.mdi',
                detect: function (target) {
                    return target.classList.contains('mdi');
                },
                render: function (icon, target) {
                    target.classList.add('mdi');
                    target.classList.add(icon);
                },
                remove: function (target) {
                    mw.tools.classNamespaceDelete(target, 'mdi-', undefined, undefined, []);
                    target.classList.remove('mdi');
                },
                icons: function () {
                    var scope = this;
                    var load = function (cb) {
                        var cssLink = mw.top().win.document.querySelector('link[href*="materialdesignicons"]');
                        if(cssLink) {
                            cb.call(undefined, cssLink);
                        }  else {
                            $.get(scope.load, function (data) {
                                cssLink = document.createElement('link');
                                cssLink.type = 'text/css';
                                cssLink.rel = 'stylesheet';
                                cssLink.href = scope.load;
                                $(document.head).append(cssLink);
                                cb.call(undefined, cssLink);
                            });
                        }
                    };
                    return new Promise(function (resolve) {
                        load(function (link){
                            if(!link || !link.sheet) {
                                resolve([]);
                                return;
                            }
                            var icons = link.sheet.cssRules;
                            var l = icons.length, i = 0, mdiIcons = [];
                            for (; i < l; i++) {
                                var sel = icons[i].selectorText;
                                if (!!sel && sel.indexOf('.mdi-') === 0) {
                                    var cls = sel.replace(".", '').split(':')[0];
                                    mdiIcons.push(cls);
                                }
                            }
                            resolve(mdiIcons);
                        });
                    });
                },
                name: 'Material Design Icons',
                load:  mw.settings.modules_url + 'microweber/css/fonts/materialdesignicons/css/materialdesignicons.min.css',
                unload: function () {
                    document.querySelector('link[href*="materialdesignicons"]').remove();
                },
                version: 'mw_local'
            },
            'mwIcons': {
                cssSelector: '[class*="mw-icon-"]',
                detect: function (target) {
                    return target.className.includes('mw-icon-');
                },
                render: function (icon, target) {
                    target.classList.add(icon);
                },
                remove: function (target) {
                    mw.tools.classNamespaceDelete(target, 'mw-icon-', undefined, undefined, []);
                },
                icons: function () {
                    return new Promise(function (resolve) {
                        $.get(mw.settings.modules_url + 'microweber/api/microweber.icons.js',function (data) {
                            resolve(JSON.parse(data));
                        });
                    });
                },
                name: 'Microweber Icons',
                load:  mw.settings.modules_url + 'microweber/css/fonts/materialdesignicons/css/materialdesignicons.min.css',
                unload: function () {
                    document.querySelector('link[href*="materialdesignicons"]').remove();
                },
                version: 'mw_local'
            },
        };

        var storage = function () {
            if(!mw.top().__IconStorage) {
                mw.top().__IconStorage = [];
            }
            return mw.top().__IconStorage;
        };

        this.storage = store || storage;


        var iconSetKey = function (options) {
            return options.name + options.version;
        };

        var iconSetPush = function (options) {
            if(!storage().find(function (a) {return iconSetKey(options) === iconSetKey(a); })) {
                return storage().push(options);
            }
            return false;
        };

        var addFontIconSet = function (options) {
            options.version = options.version || defaultVersion;
            iconSetPush(options);
            if (typeof options.load === 'string') {
                mw.require(options.load);
            } else if (typeof options.load === 'function') {
                options.load();
            }
        };
        var addIconSet = function (conf) {
            if(typeof conf === 'string') {
                if (common[conf]) {
                    conf = common[conf];
                } else {
                    console.warn(conf + ' is not defined.');
                    return;
                }
            }
            if(!conf) return;
            conf.type = conf.type || 'font';
            if (conf.type === 'font') {
                return addFontIconSet(conf);
            }
        };

        this.addIconSet = function (conf) {
            addIconSet(conf);
            return this;
        };

        this.removeIconSet = function (name, version) {
            var str = storage();
            var item = str.find(function (a) { return a.name === name && (!version || a.version === version); });
            if (item) {
                if (item.unload) {
                    item.unload();
                }
                str.splice(str.indexOf(item), 1);
            }
        };


        this.init = function () {
            storage().forEach(function (iconSet){
                scope.addIconSet(iconSet);
            });
        };

    };

    mw.iconLoader = function (options) {
        return new IconLoader(options);
    };


})();


(function (){

    var IconPicker = function (options) {
        options = options || {};
        var loader = mw.iconLoader();
        var defaults = {
            iconsPerPage: 40,
            iconOptions: {
                size: true,
                color: true,
                reset: false
            }
        };


        this.settings = mw.object.extend(true, {}, defaults, options);
        var scope = this;
        var tabAccordionBuilder = function (items) {
            var res = {root: mw.element('<div class="mw-tab-accordion" data-options="tabsSize: medium" />'), items: []};
            items.forEach(function (item){
                var el = mw.element('<div class="mw-accordion-item" />');
                var content = mw.element('<div class="mw-accordion-content mw-ui-box mw-ui-box-content">' +(item.content || '') +'</div>');
                var title = mw.element('<div class="mw-ui-box-header mw-accordion-title">' + item.title +'</div>');
                el.append(title);
                el.append(content);

                res.root.append(el);
                res.items.push({
                    title: title,
                    content: content,
                    root: el,
                });
            });
            setTimeout(function (){
                if(mw.components) {
                    mw.components._init();
                }
            }, 10);
            return res;
        };

        var createUI = function () {
            var root = mw.element({
                props: { className: 'mw-icon-selector-root' }
            });
            var iconsBlockHolder, tabs, optionsHolder, iconsHolder;
            if(scope.settings.iconOptions) {
                tabs = tabAccordionBuilder([
                    {title: 'Icons'},
                    {title: 'Options'},
                ]);
                iconsBlockHolder = tabs.items[0].content;
                optionsHolder = tabs.items[1].content;
                root.append(tabs.root)
            } else {
                iconsBlockHolder = mw.element();
                root.append(iconsBlockHolder);
            }
            iconsHolder = mw.element().addClass('mw-icon-picker-icons-holder');
            iconsBlockHolder.append(iconsHolder);
            return {
                root: root,
                tabs: tabs,
                iconsBlockHolder: iconsBlockHolder,
                iconsHolder: iconsHolder,
                optionsHolder: optionsHolder
            };
        };


        var _e = {};

        this.on = function (e, f) { _e[e] ? _e[e].push(f) : (_e[e] = [f]) };
        this.dispatch = function (e, f) { _e[e] ? _e[e].forEach(function (c){ c.call(this, f); }) : ''; };

        var actionNodes = {};

        var createOptions = function (holder) {

            if(holder && scope.settings.iconOptions) {
                if(scope.settings.iconOptions.size) {
                    var sizeel = mw.element('<div class="mwiconlist-settings-section-block-item"><label class="mw-ui-label">Icon size</label></div>');
                    var sizeinput = mw.element('<input type="range" min="8" max="200">');
                    actionNodes.size = sizeinput;
                    sizeinput.on('input', function () {
                        scope.dispatch('sizeChange', sizeinput.get(0).value);
                    });
                    sizeel.append(sizeinput);
                    holder.append(sizeel);
                }
                if(scope.settings.iconOptions.color) {
                    cel = mw.element('<div class="mwiconlist-settings-section-block-item"><label class="mw-ui-label">Color</label></div>');
                    cinput = mw.element('<input type="color">');
                    actionNodes.color = cinput;
                    cinput.on('input', function () {
                        scope.dispatch('colorChange', cinput.get(0).value);
                    });
                    cel.append(cinput);
                    holder.append(cel);
                }
                if(scope.settings.iconOptions.reset) {
                    var rel = mw.element('<div class="mwiconlist-settings-section-block-item"> </div>');
                    var rinput = mw.element('<input type="button" class="mw-ui-btn mw-ui-btn-medium" value="Reset options">');
                    rinput.on('click', function () {
                        scope.dispatch('reset', rinput.get(0).value);
                    });
                    rel.append(rinput);
                    holder.append(rel);
                }
            }
        };

        var _prepareIconsLists = function (c) {
            var sets = loader.storage();
            var all = sets.length;
            var i = 0;
            sets.forEach(function (set){
                 if (!set._iconsLists) {
                     (function (aset){
                         aset.icons().then(function (data){
                             aset._iconsLists = data;
                             i++;
                             if(i === all) c.call(sets, sets);
                         });
                     })(set);
                 } else {
                     i++;
                     if(i === all) c.call(sets, sets);
                 }

            });
        };


        var createPaging = function(length, page){
            page = page || 1;
            var max = 999;
            var pages = Math.min(Math.ceil(length/scope.settings.iconsPerPage), max);
            var paging = document.createElement('div');
            paging.className = 'mw-paging mw-paging-small mw-icon-selector-paging';
            if(scope.settings.iconsPerPage >= length ) {
                return paging;
            }
            var active = false;
            for ( var i = 1; i <= pages; i++) {
                var el = document.createElement('a');
                el.innerHTML = i;
                el._value = i;
                if(page === i) {
                    el.className = 'active';
                    active = i;
                }
                el.onclick = function () {
                    comRender({page: this._value });
                };
                paging.appendChild(el);
            }
            var all = paging.querySelectorAll('a');
            for (var i = active - 3; i < active + 2; i++){
                if(all[i]) {
                    all[i].className += ' mw-paging-visible-range';
                }
            }


            if(active < pages) {
                var next = document.createElement('a');
                next.innerHTML = '&raquo;';
                next._value = active+1;
                next.className = 'mw-paging-visible-range mw-paging-next';
                next.innerHTML = '&raquo;';
                $(paging).append(next);
                next.onclick = function () {
                     comRender({page: this._value });
                }
            }
            if(active > 1) {
                var prev = document.createElement('a');
                prev.className = 'mw-paging-visible-range mw-paging-prev';
                prev.innerHTML = '&laquo;';
                prev._value = active-1;
                $(paging).prepend(prev);
                prev.onclick = function () {
                     comRender({page: this._value });
                };
            }

            return paging;
        };

        var searchField = function () {
            var time = null;
            scope.searchField =  mw.element({
                tag: 'input',
                props: {
                    className: 'mw-ui-searchfield w100',
                    oninput: function () {
                        clearTimeout(time);
                        time = setTimeout(function (){
                            comRender();
                        }, 123);
                    }
                }
            });

            return scope.searchField;
        };

        var comRender = function (options) {
            options = options || {};
            options = mw.object.extend({}, {
                set: scope.selectField.get(0).options[scope.selectField.get(0).selectedIndex]._value,
                term: scope.searchField.get(0).value
            }, options);
            scope.ui.iconsHolder.empty().append(renderSearchResults(options));
        };

        var searchSelector = function () {
            var sel = mw.element('<select class="mw-ui-field w100" />');
            scope.selectField = sel;
            loader.storage().forEach(function (item) {
                var el = document.createElement('option');
                el._value = item;
                el.innerHTML = item.name;
                sel.append(el);
            });
            sel.on('change', function (){
                comRender()
            });
            return sel;
        };

        var search = function (conf) {
            conf = conf || {};
            conf.set = conf.set ||  loader.storage()[0];
            conf.page = conf.page || 1;
            conf.term = (conf.term || '').trim().toLowerCase();

            if (!conf.set._iconsLists) {
                return;
            }

            var all = conf.set._iconsLists.filter(function (f){ return f.toLowerCase().indexOf(conf.term) !== -1; });

            var off = scope.settings.iconsPerPage * (conf.page - 1);
            var to = off + Math.min(all.length - off, scope.settings.iconsPerPage);

            return mw.object.extend({}, conf, {
                data: all.slice(off, to),
                all: all,
                off: off
            });
            /*for ( var i = off; i < to; i++ ) {

            }*/
        };

        var renderSearchResults = function (conf) {
            var res = search(conf);
            if(!res) return;
            var pg = createPaging(res.all.length, res.page);
            var root = mw.element();
            res.data.forEach(function (iconItem){
                var icon = mw.element({
                    tag: 'span',
                    props: {
                        className: 'mwiconlist-icon',
                        onclick: function (e) {
                            scope.dispatch('select', {
                                icon: iconItem,
                                renderer: res.set.render,
                                render: function () {
                                    var sets = loader.storage();
                                    sets.forEach(function (set) {
                                        set.remove(scope.target)
                                    })
                                    return res.set.render(iconItem, scope.target);
                                }
                            });
                        }
                    }
                });
                root.append(icon);
                res.set.render(iconItem, icon.get(0));
            });
            root.append(pg)
            return root;
        };

        var createIconsBlock = function () {
            mw.spinner({element: scope.ui.iconsHolder.get(0), size: 30}).show();
            _prepareIconsLists(function (){
                comRender();
                mw.spinner({element: scope.ui.iconsHolder.get(0)}).hide();
            });
        };

        this.create = function () {
            this.ui = createUI();
            createOptions(this.ui.optionsHolder);
            this.ui.iconsBlockHolder.prepend(searchField());

            this.ui.iconsBlockHolder.prepend(searchSelector());
            createIconsBlock();

        };

        this.get = function () {
            return this.ui.root.get(0);
        };

        this.dialog = function (method) {
            if(method === 'hide') {
                this._dialog.hide();
                return;
            }
            if(!this._dialog) {
                this._dialog = mw.top().dialog({content: this.get(), title: 'Select icon', closeButtonAction: 'hide', width: 450});
                mw.components._init();
            }
            this._dialog.show();
            return this._dialog;
        };

        this.destroy = function () {
            this.get().remove()
            if(this._dialog) {
                this._dialog.remove();
            }
            if(this._tooltip) {
                this._tooltip.remove();
            }
        };

        this.target = null;

        this.tooltip = function (target) {
            this.target = target;
            if(target === 'hide' && this._tooltip) {
                this._tooltip.style.display = 'none';
            } else {
                if (!this._tooltip) {
                    this._tooltip = mw.tooltip({
                        content: this.get(),
                        element: target,
                        position: 'bottom-center',
                    });
                } else {
                    mw.tools.tooltip.setPosition(this._tooltip, target, 'bottom-center');
                }
                this._tooltip.style.display = 'block';
            }
            mw.components._init();
            return this._tooltip;
        };

        this.init = function () {
            this.create();
        };

        this.promise = function () {
            return new Promise(function (resolve){
               scope.on('select', function (data) {
                   resolve(data);
               });
            });
        };

        this.init();

    };


    mw.iconPicker = function (options) {
        return new IconPicker(options);
    };

})();







})();

(() => {
/*!************************************!*\
  !*** ../system/module_settings.js ***!
  \************************************/
mw.moduleSettings = function(options){
    /*
        options:

            data: [Object],
            element: NodeElement || selector string || jQuery array,
            schema: mw.propEditor.schema,
            key: String
            group: String,
            autoSave: Boolean

    */

    var defaults = {
        sortable: true,
        autoSave: true
    };

    if(!options.schema || !options.data || !options.element) return;

    this.options = $.extend({}, defaults, options);

    this.options.element = mw.$(this.options.element)[0];
    this.value = this.options.data.slice();

    var scope = this;

    this.items = [];

    if(!this.options.element) return;

    this.createItemHolderHeader = function(i){
        if(this.options.header){
            var header = document.createElement('div');
            header.className = "mw-ui-box-header";
            header.innerHTML = this.options.header.replace(/{count}/g, '<span class="mw-module-settings-box-index">'+(i+1)+'</span>');
            mw.$(header).on('click', function(){
                mw.$(this).next().slideToggle();
            });
            return header;

        }
    };
    this.headerAnalize = function(header){
        mw.$("[data-action='remove']", header).on('click', function(e){
            e.stopPropagation();
            e.preventDefault();
            $(mw.tools.firstParentOrCurrentWithAnyOfClasses(this, ['mw-module-settings-box'])).remove();
            scope.refactorDomPosition();
            scope.autoSave();
        });
    };
    this.createItemHolder = function(i){
        i = i || 0;
        var holder = document.createElement('div');
        var holderin = document.createElement('div');
        holder.className = 'mw-ui-box mw-module-settings-box';
        holderin.className = 'mw-ui-box-content mw-module-settings-box-content';
        holderin.style.display = 'none';
        holder.appendChild(holderin);
        if(!this.options.element.children) {
            this.options.element.appendChild(holder);
        } else if (!this.options.element.children[i]){
            this.options.element.appendChild(holder);
        } else if (this.options.element.children[i]){
            $(this.options.element.children[i]).before(holder);
        }


        return holder;
    };

    this.addNew = function(pos, method){
        method = method || 'new';
        pos = pos || 0;
        var _new;

        var val = this.value[0];

        if(val) {
            _new = mw.tools.cloneObject(JSON.parse(JSON.stringify(this.value[0])));

        } else {
            _new = {};
        }


        if(_new.title) {
            _new.title += ' - new';
        } else if(_new.name) {
            _new.name += ' - new';
        }
        if(method === 'new'){
            $.each(this.options.schema, function(){
                if(this.value) {
                    if(typeof this.value === 'function') {
                        _new[this.id] = this.value();
                    } else {
                        _new[this.id] = this.value;
                    }
                }
            });
        }

        this.value.splice(pos, 0, _new);
        this.createItem(_new, pos);
        scope.refactorDomPosition();
        scope.autoSave();
    };

    this.remove = function(pos){
        if(typeof pos === 'undefined') return;
        this.value.splice(pos, 1);
        this.items.splice(pos, 1);
        mw.$(this.options.element).children().eq(pos).animate({opacity: 0, height: 0}, function(){
            mw.$(this).remove();
        });
        mw.$(scope).trigger('change', [scope.value/*, scope.value[i]*/]);
    };

    this.createItem = function(curr, i){
        var box = this.createItemHolder(i);
        var header = this.createItemHolderHeader(i);
        var item = new mw.propEditor.schema({
            schema: this.options.schema,
            element: box.querySelector('.mw-ui-box-content')
        });
        mw.$(box).prepend(header);
        this.headerAnalize(header);
        this.items.push(item);
        item.options.element._prop = item;
        item.setValue(curr);
        mw.$(item).on('change', function(){
            $.each(item.getValue(), function(a, b){
                // todo: faster approach
                var index = mw.$(box).parent().children('.mw-module-settings-box').index(box);
                scope.value[index][a] = b;
            });
            $('[data-bind]', header).each(function () {
                var val = item.getValue();
                var bind = this.dataset.bind;
                if(val[bind]){
                    this.innerHTML = val[bind];
                } else {
                    this.innerHTML = this.dataset.orig;
                }
            });
            mw.$(scope).trigger('change', [scope.value/*, scope.value[i]*/]);
        });
        $('[data-bind]', header).each(function () {
            var val = item.getValue();
            var bind = this.dataset.bind;
            this.dataset.orig = this.innerHTML;
            if(val[bind]){
                this.innerHTML = val[bind];
            }
        });
    };

    this._autoSaveTime = null;
    this.autoSave = function(){
        if(this.options.autoSave){
            clearTimeout(this._autoSaveTime);
            this._autoSaveTime = setTimeout(function(){
                scope.save();
            }, 500);
        }
    };

    this.refactorDomPosition = function(){
        scope.items = [];
        scope.value = [];
        mw.$(".mw-module-settings-box-index", this.options.element).each(function (i) {
            mw.$(this).text(i+1);
        });
        mw.$('.mw-module-settings-box-content', this.options.element).each(function(i){
            scope.items.push(this._prop);
            scope.value.push(this._prop.getValue());
        });
        mw.$(scope).trigger('change', [scope.value]);
    };

    this.create = function(){
        this.value.forEach(function(curr, i){
            scope.createItem(curr, i);
        });
        if(this.options.sortable && $.fn.sortable){
            var conf = {
                update: function (event, ui) {
                    setTimeout(function(){
                        scope.refactorDomPosition();
                        scope.autoSave();
                    }, 10);
                },
                handle:this.options.header ? '.mw-ui-box-header' : undefined,
                axis:'y'
            };
            if(typeof this.options.sortable === 'object'){
                conf = $.extend({}, conf, this.options.sortable);
            }
            mw.$(this.options.element).sortable(conf);
        }
    };

    this.init = function(){
        this.create();
    };

    this.save = function(){
        var key = (this.options.key || this.options.option_key);
        var group = (this.options.group || this.options.option_group);
        if( key && group){
            var options = {
                group:this.options.group,
                key:this.options.key,
                value:this.toString()
            };
            mw.options.saveOption(options, function(){
                mw.notification.msg(scope.savedMessage || mw.msg.settingsSaved)
            });
        }
        else{
            if(!key){
                console.warn('Option key is not defined.');
            }
            if(!group){
                console.warn('Option group is not defined.');
            }
        }

    };


    this.toString = function(){
        return JSON.stringify(this.value);
    };

    this.init();
};

})();

(() => {
/*!********************************!*\
  !*** ../system/prop_editor.js ***!
  \********************************/
mw.require('editor.js')
mw.propEditor = {
    addInterface:function(name, func){
        this.interfaces[name] = this.interfaces[name] || func;
    },
    getRootElement: function(node){
        if(node.nodeName !== 'IFRAME') return node;
        return $(node).contents().find('body')[0];
    },
    helpers:{
        wrapper:function(){
            var el = document.createElement('div');
            el.className = 'mw-ui-field-holder prop-ui-field-holder';
            return el;
        },
        buttonNav:function(){
            var el = document.createElement('div');
            el.className = 'mw-ui-btn-nav prop-ui-field-holder';
            return el;
        },
        quatroWrapper:function(cls){
            var el = document.createElement('div');
            el.className = cls || 'prop-ui-field-quatro';
            return el;
        },
        label:function(content){
            var el = document.createElement('label');
            el.className = 'control-label d-block prop-ui-label';
            el.innerHTML = content;
            return el;
        },
        button:function(content){
            var el = document.createElement('button');
            el.className = 'mw-ui-btn';
            el.innerHTML = content;
            return el;
        },
        field: function(val, type, options){
            type = type || 'text';
            var el;
            if(type === 'select'){
                el = document.createElement('select');
                if(options && options.length){
                    var option = document.createElement('option');
                        option.innerHTML = 'Choose...';
                        option.value = '';
                        el.appendChild(option);
                    for(var i=0;i<options.length;i++){
                        var opt = document.createElement('option');
                        if(typeof options[i] === 'string' || typeof options[i] === 'number'){
                            opt.innerHTML = options[i];
                            opt.value = options[i];
                        }
                        else{
                            opt.innerHTML = options[i].title;
                            opt.value = options[i].value;
                        }
                        el.appendChild(opt);
                    }
                }
            }
            else if(type === 'textarea'){
                el = document.createElement('textarea');
            } else{
                el = document.createElement('input');
                try { // IE11 throws error on html5 types
                    el.type = type;
                } catch (err) {
                    el.type = 'text';
                }

            }

            el.className = 'form-control prop-ui-field';
            el.value = val;
            return el;
        },
        fieldPack:function(label, type){
            var field = mw.propEditor.helpers.field('', type);
            var holder = mw.propEditor.helpers.wrapper();
            label = mw.propEditor.helpers.label(label);
            holder.appendChild(label)
            holder.appendChild(field);
            return{
                label:label,
                holder:holder,
                field:field
            }
        }
    },
    rend:function(element, rend){

        element = mw.propEditor.getRootElement(element);
        for(var i=0;i<rend.length;i++){
            element.appendChild(rend[i].node);
        }
    },
    schema:function(options){
        this._after = [];
        this.setSchema = function(schema){
            this.options.schema = schema;
            this._rend = [];
            this._valSchema = this._valSchema || {};
            for(var i =0; i< this.options.schema.length; i++){
                var item = this.options.schema[i];
                if(typeof this._valSchema[item.id] === 'undefined' && this._cache.indexOf(item) === -1){
                    this._cache.push(item)
                    var curr = new mw.propEditor.interfaces[item.interface](this, item);
                    this._rend.push(curr);
                    if(item.id){
                        this._valSchema[item.id] = this._valSchema[item.id] || '';
                    }
                }
            }
            $(this.rootHolder).html(' ').addClass('mw-prop-editor-root');
            mw.propEditor.rend(this.rootHolder, this._rend);
        };
        this.updateSchema = function(schema){
            var final = [];
            for(var i =0; i<schema.length;i++){
                var item = schema[i];

                if(typeof this._valSchema[item.id] === 'undefined' && this._cache.indexOf(item) === -1){
                    this.options.schema.push(item);
                    this._cache.push(item)
                    var create = new mw.propEditor.interfaces[item.interface](this, item);
                    this._rend.push(create);
                    final.push(create);
                    if(item.id){
                        this._valSchema[item.id] = this._valSchema[item.id] || '';
                    }
                    //this.rootHolder.appendChild(create.node);
                }
            }
            return final;
        };
        this.setValue = function(val){
            if(!val){
                return;
            }
            for(var i in val){
                var rend = this.getRendById(i);
                if(!!rend){
                    rend.setValue(val[i]);
                }
            }
        };
        this.getValue = function(){
            return this._valSchema;
        };
        this.disable = function(){
            this.disabled = true;
            $(this.rootHolder).addClass('disabled');
        };
        this.enable = function(){
            this.disabled = false;
            $(this.rootHolder).removeClass('disabled');
        };
        this.getRendById = function(id) {
            for(var i in this._rend) {
                if(this._rend[i].id === id) {
                    return this._rend[i];
                }
            }
        };
        this._cache = [];
        this.options = options;
        this.options.element = typeof this.options.element === 'string' ? document.querySelector(options.element) : this.options.element;
        this.rootHolder = mw.propEditor.getRootElement(this.options.element);
        this.setSchema(this.options.schema);

        this._after.forEach(function (value) {
            value.items.forEach(function (item) {
                value.node.appendChild(item.node);
            });
        });

        mw.trigger('ComponentsLaunch');
    },

    interfaces:{
        quatro:function(proto, config){
            //"2px 4px 8px 122px"
            var holder = mw.propEditor.helpers.quatroWrapper('mw-css-editor-group');

            for(var i = 0; i<4; i++){
                var item = mw.propEditor.helpers.fieldPack(config.label[i], 'size');
                holder.appendChild(item.holder);
                item.field.oninput = function(){
                    var final = '';
                    var all = holder.querySelectorAll('input'), i = 0;
                    for( ; i<all.length; i++){
                        var unit = all[i].dataset.unit || '';
                        final+= ' ' + all[i].value + unit ;
                    }
                    proto._valSchema[config.id] = final.trim();
                     $(proto).trigger('change', [config.id, final.trim()]);
                };
            }
            this.node = holder;
            this.setValue = function(value){
                value = value.trim();
                var arr = value.split(' ');
                var all = holder.querySelectorAll('input'), i = 0;
                for( ; i<all.length; i++){
                    all[i].value = parseInt(arr[i], 10);
                    if(typeof arr[i] === 'undefined'){
                        arr[i] = '';
                    }
                    var unit = arr[i].replace(/[0-9]/g, '');
                    all[i].dataset.unit = unit;
                }
                proto._valSchema[config.id] = value;
            };
            this.id = config.id;
        },
        hr:function(proto, config){
            var el = document.createElement('hr');
            el.className = ' ';
            this.node = el;
        },
        block: function(proto, config){
            var node = document.createElement('div');
            if(typeof config.content === 'string') {
                node.innerHTML = config.content;
            } else {
                var newItems = proto.updateSchema(config.content);
                proto._after.push({node: node, items: newItems});
            }
            if(config.class){
                node.className = config.class;
            }
            this.node = node;
        },
        size:function(proto, config){
            var field = mw.propEditor.helpers.field('', 'text');
            this.field = field;
            config.autocomplete = config.autocomplete || ['auto'];

            var holder = mw.propEditor.helpers.wrapper();
            var buttonNav = mw.propEditor.helpers.buttonNav();
            var label = mw.propEditor.helpers.label(config.label);
            var scope = this;
            var dtlist = document.createElement('datalist');
            dtlist.id = 'mw-datalist-' + mw.random();
            config.autocomplete.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                dtlist.appendChild(option)
            });

            this.field.setAttribute('list', dtlist.id);
            document.body.appendChild(dtlist);

            this._makeVal = function(){
                if(field.value === 'auto'){
                    return 'auto';
                }
                return field.value + field.dataset.unit;
            };

            var unitSelector = mw.propEditor.helpers.field('', 'select', [
                'px', '%', 'rem', 'em', 'vh', 'vw', 'ex', 'cm', 'mm', 'in', 'pt', 'pc', 'ch'
            ]);
            this.unitSelector = unitSelector;
            $(holder).addClass('prop-ui-field-holder-size');
            $(unitSelector)
                .val('px')
                .addClass('prop-ui-field-unit');
            unitSelector.onchange = function(){
                field.dataset.unit = $(this).val() || 'px';

                $(proto).trigger('change', [config.id, scope._makeVal()]);
            };

            $(unitSelector).on('change', function(){

            });

            holder.appendChild(label);
            buttonNav.appendChild(field);
            buttonNav.appendChild(unitSelector);
            holder.appendChild(buttonNav);

            field.oninput = function(){

                proto._valSchema[config.id] = this.value + this.dataset.unit;
                $(proto).trigger('change', [config.id, scope._makeVal()]);
            };

            this.node = holder;
            this.setValue = function(value){
                var an = parseInt(value, 10);
                field.value = isNaN(an) ? value : an;
                proto._valSchema[config.id] = value;
                var unit = value.replace(/[0-9]/g, '').replace(/\./g, '');
                field.dataset.unit = unit;
                $(unitSelector).val(unit);
            };
            this.id = config.id;

        },
        text:function(proto, config){
            var val = '';
            if(config.value){
                if(typeof config.value === 'function'){
                    val = config.value();
                } else {
                    val = config.value;
                }
            }
            var field = mw.propEditor.helpers.field(val, 'text');
            var holder = mw.propEditor.helpers.wrapper();
            var label = mw.propEditor.helpers.label(config.label);
            holder.appendChild(label);
            holder.appendChild(field);
            field.oninput = function(){
                proto._valSchema[config.id] = this.value;
                $(proto).trigger('change', [config.id, this.value]);
            };
            this.node = holder;
            this.setValue = function(value){
                field.value = value;
                proto._valSchema[config.id] = value;
            };
            this.id = config.id;
        },
        hidden:function(proto, config){
            var val = '';
            if(config.value){
                if(typeof config.value === 'function'){
                    val = config.value();
                } else {
                    val = config.value;
                }
            }

            var field = mw.propEditor.helpers.field(val, 'hidden');
            var holder = mw.propEditor.helpers.wrapper();
            var label = mw.propEditor.helpers.label(config.label);
            holder.appendChild(label);
            holder.appendChild(field);
            field.oninput = function(){
                proto._valSchema[config.id] = this.value;
                $(proto).trigger('change', [config.id, this.value]);
            };
            this.node = holder;
            this.setValue = function(value){
                field.value = value;
                proto._valSchema[config.id] = value;
            };
            this.id = config.id;
        },
        shadow: function(proto, config){
            var scope = this;

            this.fields = {
                position : mw.propEditor.helpers.field('', 'select', [{title:'Outside', value: ''}, {title:'Inside', value: 'inset'}]),
                x : mw.propEditor.helpers.field('', 'number'),
                y : mw.propEditor.helpers.field('', 'number'),
                blur : mw.propEditor.helpers.field('', 'number'),
                spread : mw.propEditor.helpers.field('', 'number'),
                color : mw.propEditor.helpers.field('', 'text')
            };

            this.fields.position.placeholder = 'Position';
            this.fields.x.placeholder = 'X offset';
            this.fields.y.placeholder = 'Y offset';
            this.fields.blur.placeholder = 'Blur';
            this.fields.spread.placeholder = 'Spread';
            this.fields.color.placeholder = 'Color';
            this.fields.color.dataset.options = 'position: ' + (config.pickerPosition || 'bottom-center');
            //$(this.fields.color).addClass('mw-color-picker');
            mw.colorPicker({
                element:this.fields.color,
                position:'top-left',
                onchange:function(color){
                    $(scope.fields.color).trigger('change', color)
                    scope.fields.color.style.backgroundColor = color;
                    scope.fields.color.style.color = mw.color.isDark(color) ? 'white' : 'black';
                }
            });

            var labelPosition = mw.propEditor.helpers.label('Position');
            var labelX = mw.propEditor.helpers.label('X offset');
            var labelY = mw.propEditor.helpers.label('Y offset');
            var labelBlur = mw.propEditor.helpers.label('Blur');
            var labelSpread = mw.propEditor.helpers.label('Spread');
            var labelColor = mw.propEditor.helpers.label('Color');

            var wrapPosition = mw.propEditor.helpers.wrapper();
            var wrapX = mw.propEditor.helpers.wrapper();
            var wrapY = mw.propEditor.helpers.wrapper();
            var wrapBlur = mw.propEditor.helpers.wrapper();
            var wrapSpread = mw.propEditor.helpers.wrapper();
            var wrapColor = mw.propEditor.helpers.wrapper();



            this.$fields = $();

            $.each(this.fields, function(){
                scope.$fields.push(this);
            });

            $(this.$fields).on('input change', function(){
                var val = ($(scope.fields.position).val() || '')
                    + ' ' + (scope.fields.x.value || 0) + 'px'
                    + ' ' + (scope.fields.y.value || 0) + 'px'
                    + ' ' + (scope.fields.blur.value || 0) + 'px'
                    + ' ' + (scope.fields.spread.value || 0) + 'px'
                    + ' ' + (scope.fields.color.value || 'rgba(0,0,0,.5)');
                proto._valSchema[config.id] = val;
                $(proto).trigger('change', [config.id, val]);
            });


            var holder = mw.propEditor.helpers.wrapper();

            var label = mw.propEditor.helpers.label(config.label ? config.label : '');
            if(config.label){
                holder.appendChild(label);
            }
            var row1 = mw.propEditor.helpers.wrapper();
            var row2 = mw.propEditor.helpers.wrapper();
            row1.className = 'mw-css-editor-group';
            row2.className = 'mw-css-editor-group';


            wrapPosition.appendChild(labelPosition);
            wrapPosition.appendChild(this.fields.position);
            row1.appendChild(wrapPosition);

            wrapX.appendChild(labelX);
            wrapX.appendChild(this.fields.x);
            row1.appendChild(wrapX);


            wrapY.appendChild(labelY);
            wrapY.appendChild(this.fields.y);
            row1.appendChild(wrapY);

            wrapColor.appendChild(labelColor);
            wrapColor.appendChild(this.fields.color);
            row2.appendChild(wrapColor);

            wrapBlur.appendChild(labelBlur);
            wrapBlur.appendChild(this.fields.blur);
            row2.appendChild(wrapBlur);

            wrapSpread.appendChild(labelSpread);
            wrapSpread.appendChild(this.fields.spread);
            row2.appendChild(wrapSpread);

            holder.appendChild(row1);
            holder.appendChild(row2);

            $(this.fields).each(function () {
                $(this).on('input change', function(){
                    proto._valSchema[config.id] = this.value;
                    $(proto).trigger('change', [config.id, this.value]);
                });
            });


            this.node = holder;
            this.setValue = function(value){
                var parse = this.parseShadow(value);
                $.each(parse, function (key, val) {
                    scope.fields[key].value = this;
                });
                proto._valSchema[config.id] = value;
            };
            this.parseShadow = function(shadow){
                var inset = false;
                if(shadow.indexOf('inset') !== -1){
                    inset = true;
                }
                var arr = shadow.replace('inset', '').trim().replace(/\s{2,}/g, ' ').split(' ');
                var sh = {
                    position: inset ? 'in' : 'out',
                    x:0,
                    y: 0,
                    blur: 0,
                    spread: 0,
                    color: 'transparent'
                };
                if(!arr[2]){
                    return sh;
                }
                sh.x = arr[0];
                sh.y = arr[1];
                sh.blur = (!isNaN(parseInt(arr[2], 10))?arr[2]:'0px');
                sh.spread = (!isNaN(parseInt(arr[3], 10))?arr[3]:'0px');
                sh.color = isNaN(parseInt(arr[arr.length-1])) ? arr[arr.length-1] : 'transparent';
                return sh;
            };
            this.id = config.id;
        },
        number:function(proto, config){
            var field = mw.propEditor.helpers.field('', 'number');
            var holder = mw.propEditor.helpers.wrapper();
            var label = mw.propEditor.helpers.label(config.label);
            holder.appendChild(label);
            holder.appendChild(field);
            field.oninput = function(){
                proto._valSchema[config.id] = this.value;
                $(proto).trigger('change', [config.id, this.value]);
            };
            this.node = holder;
            this.setValue=function(value){
                field.value = parseInt(value, 10);
                proto._valSchema[config.id] = value;
            };
            this.id = config.id;
        },
        color:function(proto, config){
            var field = mw.propEditor.helpers.field('', 'text');
            if(field.type !== 'color'){
                mw.colorPicker({
                    element:field,
                    position: config.position || 'bottom-center',
                    onchange:function(){
                        $(proto).trigger('change', [config.id, field.value]);
                    }
                });
            }
            var holder = mw.propEditor.helpers.wrapper();
            var label = mw.propEditor.helpers.label(config.label);
            holder.appendChild(label);
            holder.appendChild(field);
            field.oninput = function(){
                proto._valSchema[config.id] = this.value;
                $(proto).trigger('change', [config.id, this.value]);
            }
            this.node = holder;
            this.setValue = function(value){
                field.value = value;
                proto._valSchema[config.id] = value
            };
            this.id = config.id
        },
        select:function(proto, config){
            var field = mw.propEditor.helpers.field('', 'select', config.options);
            var holder = mw.propEditor.helpers.wrapper();
            var label = mw.propEditor.helpers.label(config.label);
            holder.appendChild(label);
            holder.appendChild(field);
            field.onchange = function(){
                proto._valSchema[config.id] = this.value;
                $(proto).trigger('change', [config.id, this.value]);
            };
            this.node = holder;
            this.setValue = function(value){
                field.value = value;
                proto._valSchema[config.id] = value
            };
            this.id = config.id;
        },
        file:function(proto, config){
            if(config.multiple === true){
                config.multiple = 99;
            }
            if(!config.multiple){
                config.multiple = 1;
            }
            var scope = this;
            var createButton = function(imageUrl, i, proto){
                imageUrl = imageUrl || '';
                var el = document.createElement('div');
                el.className = 'upload-button-prop mw-ui-box mw-ui-box-content';
                var btn =  document.createElement('span');
                btn.className = ('mw-ui-btn');
                btn.innerHTML = ('<span class="mw-icon-upload"></span>');
                btn.style.backgroundSize = 'cover';
                btn.style.backgroundColor = 'transparent';
                el.style.backgroundSize = 'cover';
                btn._value = imageUrl;
                btn._index = i;
                if(imageUrl){
                    el.style.backgroundImage = 'url(' + imageUrl + ')';
                }
                btn.onclick = function(){
                    mw.top().fileWindow({
                        types:'images',
                        change:function(url){
                            if(!url) return;
                            url = url.toString();
                            proto._valSchema[config.id] = proto._valSchema[config.id] || [];
                            proto._valSchema[config.id][btn._index] = url;
                            el.style.backgroundImage = 'url(' + url + ')';
                            btn._value = url;
                            scope.refactor();
                        }
                    });
                };
                var close = document.createElement('span');
                close.className = 'mw-badge mw-badge-important';
                close.innerHTML = '<span class="mw-icon-close"></span>';

                close.onclick = function(e){
                    scope.remove(el);
                    e.preventDefault();
                    e.stopPropagation();
                };
                el.appendChild(close);
                el.appendChild(btn);
                return el;
            };

            this.remove = function (i) {
                if(typeof i === 'number'){
                    $('.upload-button-prop', el).eq(i).remove();
                }
                else{
                    $(i).remove();
                }
                scope.refactor();
            };

            this.addImageButton = function(){
                if(config.multiple){
                    this.addBtn = document.createElement('div');
                    this.addBtn.className = 'mw-ui-link';
                    //this.addBtn.innerHTML = '<span class="mw-icon-plus"></span>';
                    this.addBtn.innerHTML = mw.msg.addImage;
                    this.addBtn.onclick = function(){
                        el.appendChild(createButton(undefined, 0, proto));
                        scope.manageAddImageButton();
                    };
                    holder.appendChild(this.addBtn);
                }
            };

            this.manageAddImageButton = function(){
                var isVisible = $('.upload-button-prop', this.node).length < config.multiple;
                this.addBtn.style.display = isVisible ? 'inline-block' : 'none';
            };

            var btn = createButton(undefined, 0, proto);
            var holder = mw.propEditor.helpers.wrapper();
            var label = mw.propEditor.helpers.label(config.label);
            holder.appendChild(label);
            var el = document.createElement('div');
            el.className = 'mw-ui-box-content';
            el.appendChild(btn);
            holder.appendChild(el);

            this.addImageButton();
            this.manageAddImageButton();

            if($.fn.sortable){
                $(el).sortable({
                    update:function(){
                        scope.refactor();
                    }
                });
            }



            this.refactor = function () {
                var val = [];
                $('.mw-ui-btn', el).each(function(){
                    val.push(this._value);
                });
                this.manageAddImageButton();
                if(val.length === 0){
                    val = [''];
                }
                proto._valSchema[config.id] = val;
                $(proto).trigger('change', [config.id, proto._valSchema[config.id]]);
            };

            this.node = holder;
            this.setValue = function(value){
                value = value || [''];
                proto._valSchema[config.id] = value;
                $('.upload-button-prop', holder).remove();
                if(typeof value === 'string'){
                    el.appendChild(createButton(value, 0, proto));
                }
                else{
                    $.each(value, function (index) {
                        el.appendChild(createButton(this, index, proto));
                    });
                }

                this.manageAddImageButton();
            };
            this.id = config.id;
        },
        icon: function(proto, config){
            var holder = mw.propEditor.helpers.wrapper();

            var el = document.createElement('span');
            el.className = "mw-ui-btn mw-ui-btn-medium mw-ui-btn-notification mw-ui-btn-outline";
            var elTarget = document.createElement('i');

/*            var selector = mw.iconSelector.iconDropdown(holder, {
                onchange: function (ic) {
                    proto._valSchema[config.id] = ic;
                    $(proto).trigger('change', [config.id, ic]);
                },
                mode: 'relative',
                value: ''
            });*/

            el.onclick = function () {
                picker.dialog();
            };
            mw.iconLoader().init();
            var picker = mw.iconPicker({iconOptions: false});
            picker.target = elTarget;
            picker.on('select', function (data) {
                data.render();
                proto._valSchema[config.id] = picker.target.outerHTML;
                $(proto).trigger('change', [config.id, picker.target.outerHTML]);
                picker.dialog('hide');
             });

            var label = mw.propEditor.helpers.label(config.label);

            $(el).prepend(elTarget);
            $(holder).prepend(el);
            $(holder).prepend(label);

            this.node = holder;
            this.setValue = function(value){
                if(picker && picker.value) {
                    picker.value(value);

                }
                proto._valSchema[config.id] = value;
            };
            this.id = config.id;

        },
        richtext:function(proto, config){
            var field = mw.propEditor.helpers.field('', 'textarea');
            var holder = mw.propEditor.helpers.wrapper();
            var label = mw.propEditor.helpers.label(config.label);
            holder.appendChild(label);
            holder.appendChild(field);
            $(field).on('change', function(){
                proto._valSchema[config.id] = this.value;
                $(proto).trigger('change', [config.id, this.value]);
            });
            this.node = holder;
            this.setValue = function(value){
                field.value = value;
                this.editor.setContent(value, true);
                proto._valSchema[config.id] = value;
            };
            this.id = config.id;
            var defaults = {
                height: 120,
                mode: 'div',
                smallEditor: false,
                controls: [
                    [
                        'bold', 'italic',
                        {
                            group: {
                                icon: 'mdi xmdi-format-bold',
                                controls: ['underline', 'strikeThrough', 'removeFormat']
                            }
                        },

                        '|', 'align', '|', 'textColor', 'textBackgroundColor', '|', 'link', 'unlink'
                    ],
                ]
            };
            config.options = config.options || {};
            this.editor = mw.Editor($.extend({}, defaults, config.options, {selector: field}));
        }
    }
};

})();

(() => {
/*!**************************!*\
  !*** ../system/state.js ***!
  \**************************/
(function (){
    if(mw.State) return;
    var State = function(options){

        var scope = this;
        var defaults = {
            maxItems: 1000
        };
        this.options = $.extend({}, defaults, (options || {}));
        this._state = this.options.state || [];
        this._active = null;
        this._activeIndex = -1;

        this.hasNext = false;
        this.hasPrev = false;

        this.state = function(state){
            if(!state){
                return this._state;
            }
            this._state = state;
            return this;
        };


        this.active = function(active){
            if(!active){
                return this._active;
            }
        };

        this.activeIndex = function(activeIndex){
            if(!activeIndex){
                return this._activeIndex;
            }
        };

        this._timeout = null;
        this.timeoutRecord = function(item){
            clearTimeout(this._timeout);
            this._timeout = setTimeout(function(scope, item){
                scope.record(item);
            }, 333, this, item);
        };

        var recentRecordIsEqual = function (item) {
            const curr = scope._state[0];
            if(!curr) return false;
            for (var n in item) {
                if(curr[n] !== item[n]) {
                    return false;
                }
            }
            return true;
        };

        this.record = function(item){
            if(this._activeIndex>-1) {
                var i = 0;
                while ( i <  this._activeIndex) {
                    this._state.shift();
                    i++;
                }
            }
            if (recentRecordIsEqual(item)) {
                return;
            }
            this._state.unshift(item);
            if(this._state.length >= this.options.maxItems) {
                this._state.splice(-1,1);
            }
            this._active = null;
            this._activeIndex = -1;
            this.afterChange(false);
            mw.$(this).trigger('stateRecord', [this.eventData()]);
            return this;
        };

        this.actionRecord = function(recordGenFunc, action){
            this.record(recordGenFunc());
            action.call();
            this.record(recordGenFunc());
        };

        this.redo = function(){
            this._activeIndex--;
            this._active = this._state[this._activeIndex];
            this.afterChange('stateRedo');
            return this;
        };

        this.undo = function(){
            if(this._activeIndex === -1) {
                this._activeIndex = 1;
            }
            else{
                this._activeIndex++;
            }
            this._active = this._state[this._activeIndex];
            this.afterChange('stateUndo');
            return this;
        };

        this.hasRecords = function(){
            return !!this._state.length;
        };

        this.eventData = function(){
            return {
                hasPrev: this.hasPrev,
                hasNext: this.hasNext,
                active: this.active(),
                activeIndex: this.activeIndex()
            };
        };
        this.afterChange = function(action){
            this.hasNext = true;
            this.hasPrev = true;

            if(action) {
                if(this._activeIndex >= this._state.length) {
                    this._activeIndex = this._state.length - 1;
                    this._active = this._state[this._activeIndex];
                }
            }

            if(this._activeIndex <= 0) {
                this.hasPrev = false;
            }
            if(this._activeIndex === this._state.length-1 || (this._state.length === 1 && this._state[0].$initial)) {
                this.hasNext = false;
            }

            if(action){

                mw.$(this).trigger(action, [this.eventData()]);
            }
            if(action !== false){
                mw.$(this).trigger('change', [this.eventData()]);
            }
            return this;
        };

        this.reset = function(){
            this._state = this.options.state || [];
            this.afterChange('reset');
            return this;
        };

        this.clear = function(){
            this._state = [];
            this.afterChange('clear');
            return this;
        };


    };
    mw.State = State;
})();

(function(){
    if(mw.liveEditState) return;
    mw.liveEditState = new mw.State();
    mw.liveEditState.record({
         value: null,
         $initial: true
    });
    mw.$liveEditState = mw.$(mw.liveEditState);

    var ui = mw.$('<div class="mw-ui-btn-nav"></div>'),
        undo = document.createElement('span'),
        redo = document.createElement('span');
    undo.className = 'mw-ui-btn mw-ui-btn-medium';
    undo.innerHTML = '<span class="mw-icon-reply"></span>';
    redo.className = 'mw-ui-btn mw-ui-btn-medium';
    redo.innerHTML = '<span class="mw-icon-forward"></span>';

    undo.onclick = function(){
        mw.liveEditState.undo();
    };
    redo.onclick = function(){
        mw.liveEditState.redo();
    };

    ui.append(undo);
    ui.append(redo);

    mw.$(document).ready(function(){
        var idata = mw.liveEditState.eventData();

        mw.$(undo)[!idata.hasNext?'addClass':'removeClass']('disabled');
        mw.$(redo)[!idata.hasPrev?'addClass':'removeClass']('disabled');

        /*undo.disabled = !idata.hasNext;
        redo.disabled = !idata.hasPrev;*/

        var edits = document.querySelectorAll('.edit'), editstime = null;

        for ( var i = 0; i < edits.length; i++ ) {
            if(!mw.tools.hasParentsWithClass(this, 'edit')) {
                edits[i].addEventListener('keydown', function (e) {
                    var sel = getSelection();
                    var target = mw.wysiwyg.validateCommonAncestorContainer(sel.focusNode);
                    if(target && !target.__initialRecord) {
                        target.__initialRecord = true;

                        mw.liveEditState.record({
                            target: target,
                            value: target.innerHTML
                        });
                    }
                });
                edits[i].addEventListener('input', function (e) {
                    clearTimeout(editstime);
                    editstime = setTimeout(function () {
                        var sel = getSelection();
                        var target = mw.wysiwyg.validateCommonAncestorContainer(sel.focusNode);
                        if(!target) return;
                        mw.liveEditState.record({
                            target: target,
                            value: target.innerHTML
                        });
                        this.__initialRecord = false;
                    }, 1234);
                });
            }
        }

        mw.$liveEditState.on('stateRecord', function(e, data){
            mw.$(undo)[!data.hasNext?'addClass':'removeClass']('disabled');
            mw.$(redo)[!data.hasPrev?'addClass':'removeClass']('disabled');
        });
        mw.$liveEditState.on('stateUndo stateRedo', function(e, data){



            if(!data.active || (!data.active.target && !data.active.action)) {
                mw.$(undo)[!data.hasNext?'addClass':'removeClass']('disabled');
                mw.$(redo)[!data.hasPrev?'addClass':'removeClass']('disabled');
                return;
            }
            if(data.active.action) {
                data.active.action();
            } else if(document.body.contains(data.active.target)) {
                mw.$(data.active.target).html(data.active.value);
            } else{
                if(data.active.target.id) {
                    mw.$(document.getElementById(data.active.target.id)).html(data.active.value);
                }
            }
            if(data.active.prev) {
                mw.$(data.active.prev).html(data.active.prevValue);
            }
            mw.drag.load_new_modules();
            mw.$(undo)[!data.hasNext?'addClass':'removeClass']('disabled');
            mw.$(redo)[!data.hasPrev?'addClass':'removeClass']('disabled');
        });

        mw.$('#history_panel_toggle,#history_dd,.mw_editor_undo,.mw_editor_redo').remove();
        mw.$('.wysiwyg-cell-undo-redo').eq(0).prepend(ui);





        mw.element(document.body).on('keydown', function(e) {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                mw.liveEditState.undo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                mw.liveEditState.redo();
            }
        });

    });

})();



})();

(() => {
/*!***************************************!*\
  !*** ../tools/system-tools/base64.js ***!
  \***************************************/
mw.tools.base64 = {
// private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
// public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = mw.tools.base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
// public method for decoding
    decode: function (input) {
        if (typeof input == 'undefined') {
            return;
        }
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = mw.tools.base64._utf8_decode(output);
        return output;
    },
// private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
// private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}
})();

(() => {
/*!********************************************!*\
  !*** ../tools/system-tools/image-tools.js ***!
  \********************************************/
mw.image.description =  {
    add: function (text) {
        var img = document.querySelector("img.element-current");
        img.title = text;
    },
    get: function () {
        return document.querySelector("img.element-current").title;
    },
    init: function (id) {
        var area = mw.$(id);
        area.hover(function () {
            area.addClass("desc_area_hover");
        }, function () {
            area.removeClass("desc_area_hover");
        });
        var curr = mw.image.description.get();
        if (!area.hasClass("inited")) {
            area.addClass("inited");
            area.bind("keyup change paste", function () {
                var val = mw.$(this).val();
                mw.image.description.add(val);
            });
        }
        area.val(curr);
        area.show();
    }
};

mw.image.settings = function () {
    return mw.dialogIframe({
        url: 'imageeditor',
        template: "mw_modal_basic",
        overlay: true,
        width: '600',
        height: "auto",
        autoHeight: true,
        name: 'mw-image-settings-modal'
    });
};


(function (){
    var image = {
        isResizing: false,
        currentResizing: null,
        resize: {
            create_resizer: function () {
                if (!mw.image_resizer) {
                    var resizer = document.createElement('div');
                    resizer.className = 'mw-defaults mw_image_resizer';
                    resizer.innerHTML = '<div id="image-edit-nav"><span onclick="mw.wysiwyg.media(\'#editimage\');" class="mw-ui-btn mw-ui-btn-medium mw-ui-btn-invert mw-ui-btn-icon image_change tip" data-tip="' + mw.msg.change + '"><span class="mdi mdi-image mdi-18px"></span></span><span class="mw-ui-btn mw-ui-btn-medium mw-ui-btn-invert mw-ui-btn-icon tip image_change" id="image-settings-button" data-tip="' + mw.msg.edit + '" onclick="mw.image.settings();"><span class="mdi mdi-pencil mdi-18px"></span></span></div>';
                    document.body.appendChild(resizer);
                    mw.image_resizer = resizer;
                    mw.image_resizer_time = null;
                    mw.image_resizer._show = function () {
                        clearTimeout(mw.image_resizer_time);
                        mw.$(mw.image_resizer).addClass('active');
                    };
                    mw.image_resizer._hide = function () {
                        clearTimeout(mw.image_resizer_time);
                        mw.image_resizer_time = setTimeout(function () {
                            mw.$(mw.image_resizer).removeClass('active');
                        }, 3000)
                    };

                    mw.$(resizer).on("click", function (e) {
                        if (mw.image.currentResizing[0].nodeName === 'IMG') {
                            mw.wysiwyg.select_element(mw.image.currentResizing[0]);
                        }
                    });
                    mw.$(resizer).on("dblclick", function (e) {
                        mw.wysiwyg.media('#editimage');
                    });
                }
            },
            prepare: function () {
                mw.image.resize.create_resizer();
                mw.$(mw.image_resizer).resizable({
                    handles: "all",
                    minWidth: 60,
                    minHeight: 60,
                    start: function () {
                        mw.image.isResizing = true;
                        mw.$(mw.image_resizer).resizable("option", "maxWidth", mw.image.currentResizing.parent().width());
                        mw.$(mw.tools.firstParentWithClass(mw.image.currentResizing[0], 'edit')).addClass("changed");
                    },
                    stop: function () {
                        mw.image.isResizing = false;
                        mw.drag.fix_placeholders();
                    },
                    resize: function () {
                        var offset = mw.image.currentResizing.offset();
                        mw.$(this).css(offset);
                    },
                    aspectRatio: 16 / 9
                });
                mw.image_resizer.mwImageResizerComponent = true;
                var all = mw.image_resizer.querySelectorAll('*'), l = all.length, i = 0;
                for (; i < l; i++) all[i].mwImageResizerComponent = true
            },
            resizerSet: function (el, selectImage) {
                var selectImage = typeof selectImage === 'undefined' ? true : selectImage;
                /*  var order = mw.tools.parentsOrder(el, ['edit', 'module']);
                 if(!(order.module > -1 && order.edit > order.module) && order.edit>-1){   */


                mw.$('.ui-resizable-handle', mw.image_resizer)[el.nodeName == 'IMG' ? 'show' : 'hide']()

                var el = mw.$(el);
                var offset = el.offset();
                var parent = el.parent();
                var parentOffset = parent.offset();
                if(parent[0].nodeName !== 'A'){
                    offset.top = offset.top < parentOffset.top ? parentOffset.top : offset.top;
                    offset.left = offset.left < parentOffset.left ? parentOffset.left : offset.left;
                }
                var r = mw.$(mw.image_resizer);
                var width = el.outerWidth();
                var height = el.outerHeight();
                r.css({
                    left: offset.left,
                    top: offset.top,
                    width: width,
                    height: mw.tools.hasParentsWithClass(el[0], 'mw-image-holder') ? 1 : height
                });
                r.addClass("active");
                mw.$(mw.image_resizer).resizable("option", "alsoResize", el);
                mw.$(mw.image_resizer).resizable("option", "aspectRatio", width / height);
                mw.image.currentResizing = el;
                if (!el[0].contentEditable) {
                    mw.wysiwyg.contentEditable(el[0], true);
                }

                if (selectImage) {
                    if (el[0].parentNode.tagName !== 'A') {
                        mw.wysiwyg.select_element(el[0]);
                    }
                    else {
                        mw.wysiwyg.select_element(el[0].parentNode);
                    }
                }
                if (document.getElementById('image-settings-button') !== null) {
                    if (!!el[0].src && el[0].src.contains('userfiles/media/pixum/')) {
                        document.getElementById('image-settings-button').style.display = 'none';
                    }
                    else {
                        document.getElementById('image-settings-button').style.display = '';
                    }
                }
                /* } */
            },
            init: function (selector) {
                mw.image_resizer == undefined ? mw.image.resize.prepare() : '';

                mw.on("ImageClick", function (e, el) {
                    if (!mw.image.isResizing && !mw.isDrag && !mw.settings.resize_started && el.tagName === 'IMG') {
                        mw.image.resize.resizerSet(el);
                    }
                })
            }
        },

        _isrotating: false,
        rotate: function (img_object, angle) {
            if (!mw.image.Rotator) {
                mw.image.Rotator = document.createElement('canvas');
                mw.image.Rotator.style.top = '-9999px';
                mw.image.Rotator.style.left = '-9999px';
                mw.image.Rotator.style.position = 'absolute';
                mw.image.RotatorContext = mw.image.Rotator.getContext('2d');
                document.body.appendChild(mw.image.Rotator);
            }
            if (!mw.image._isrotating) {
                mw.image._isrotating = true;
                img_object = img_object || document.querySelector("img.element-current");
                if (img_object === null) {
                    return false;
                }
                mw.image.preload(img_object.src, function () {
                    if (!img_object.src.contains("base64")) {
                        var currDomain = mw.url.getDomain(window.location.href);
                        var srcDomain = mw.url.getDomain(img_object.src);
                        if (currDomain !== srcDomain) {
                            mw.tools.alert("This action is allowed for images on the same domain.");
                            return false;
                        }
                    }
                    var angle = angle || 90;
                    var image = mw.$(this);
                    var w = this.naturalWidth;
                    var h = this.naturalHeight;
                    var contextWidth = w;
                    var contextHeight = h;
                    var x = 0;
                    var y = 0;
                    switch (angle) {
                        case 90:
                            contextWidth = h;
                            contextHeight = w;
                            y = -h;
                            break;
                        case 180:
                            x = -w;
                            y = -h;
                            break;
                        case 270:
                            contextWidth = h;
                            contextHeight = w;
                            x = -w;
                            break;
                        default:
                            contextWidth = h;
                            contextHeight = w;
                            y = -h;
                    }
                    mw.image.Rotator.setAttribute('width', contextWidth);
                    mw.image.Rotator.setAttribute('height', contextHeight);
                    mw.image.RotatorContext.rotate(angle * Math.PI / 180);
                    mw.image.RotatorContext.drawImage(img_object, x, y);
                    var data = mw.image.Rotator.toDataURL("image/png");
                    img_object.src = data;
                    mw.image._isrotating = false;
                    if (!!mw.wysiwyg) mw.wysiwyg.normalizeBase64Image(img_object);
                });
            }
        },
        grayscale: function (node) {
            var node = node || document.querySelector("img.element-current");
            if (node === null) {
                return false;
            }
            mw.image.preload(node.src, function () {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;
                ctx.drawImage(node, 0, 0);
                var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (var y = 0; y < imgPixels.height; y++) {
                    for (var x = 0; x < imgPixels.width; x++) {
                        var i = (y * 4) * imgPixels.width + x * 4; //Why is this multiplied by 4?
                        var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                        imgPixels.data[i] = avg;
                        imgPixels.data[i + 1] = avg;
                        imgPixels.data[i + 2] = avg;
                    }
                }
                ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
                node.src = canvas.toDataURL();
                if (!!mw.wysiwyg) mw.wysiwyg.normalizeBase64Image(node);
            })
        },
        vr: [0, 0, 0, 1, 1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 19, 19, 20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 39, 40, 41, 42, 44, 45, 47, 48, 49, 52, 54, 55, 57, 59, 60, 62, 65, 67, 69, 70, 72, 74, 77, 79, 81, 83, 86, 88, 90, 92, 94, 97, 99, 101, 103, 107, 109, 111, 112, 116, 118, 120, 124, 126, 127, 129, 133, 135, 136, 140, 142, 143, 145, 149, 150, 152, 155, 157, 159, 162, 163, 165, 167, 170, 171, 173, 176, 177, 178, 180, 183, 184, 185, 188, 189, 190, 192, 194, 195, 196, 198, 200, 201, 202, 203, 204, 206, 207, 208, 209, 211, 212, 213, 214, 215, 216, 218, 219, 219, 220, 221, 222, 223, 224, 225, 226, 227, 227, 228, 229, 229, 230, 231, 232, 232, 233, 234, 234, 235, 236, 236, 237, 238, 238, 239, 239, 240, 241, 241, 242, 242, 243, 244, 244, 245, 245, 245, 246, 247, 247, 248, 248, 249, 249, 249, 250, 251, 251, 252, 252, 252, 253, 254, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        vg: [0, 0, 1, 2, 2, 3, 5, 5, 6, 7, 8, 8, 10, 11, 11, 12, 13, 15, 15, 16, 17, 18, 18, 19, 21, 22, 22, 23, 24, 26, 26, 27, 28, 29, 31, 31, 32, 33, 34, 35, 35, 37, 38, 39, 40, 41, 43, 44, 44, 45, 46, 47, 48, 50, 51, 52, 53, 54, 56, 57, 58, 59, 60, 61, 63, 64, 65, 66, 67, 68, 69, 71, 72, 73, 74, 75, 76, 77, 79, 80, 81, 83, 84, 85, 86, 88, 89, 90, 92, 93, 94, 95, 96, 97, 100, 101, 102, 103, 105, 106, 107, 108, 109, 111, 113, 114, 115, 117, 118, 119, 120, 122, 123, 124, 126, 127, 128, 129, 131, 132, 133, 135, 136, 137, 138, 140, 141, 142, 144, 145, 146, 148, 149, 150, 151, 153, 154, 155, 157, 158, 159, 160, 162, 163, 164, 166, 167, 168, 169, 171, 172, 173, 174, 175, 176, 177, 178, 179, 181, 182, 183, 184, 186, 186, 187, 188, 189, 190, 192, 193, 194, 195, 195, 196, 197, 199, 200, 201, 202, 202, 203, 204, 205, 206, 207, 208, 208, 209, 210, 211, 212, 213, 214, 214, 215, 216, 217, 218, 219, 219, 220, 221, 222, 223, 223, 224, 225, 226, 226, 227, 228, 228, 229, 230, 231, 232, 232, 232, 233, 234, 235, 235, 236, 236, 237, 238, 238, 239, 239, 240, 240, 241, 242, 242, 242, 243, 244, 245, 245, 246, 246, 247, 247, 248, 249, 249, 249, 250, 251, 251, 252, 252, 252, 253, 254, 255],
        vb: [53, 53, 53, 54, 54, 54, 55, 55, 55, 56, 57, 57, 57, 58, 58, 58, 59, 59, 59, 60, 61, 61, 61, 62, 62, 63, 63, 63, 64, 65, 65, 65, 66, 66, 67, 67, 67, 68, 69, 69, 69, 70, 70, 71, 71, 72, 73, 73, 73, 74, 74, 75, 75, 76, 77, 77, 78, 78, 79, 79, 80, 81, 81, 82, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 88, 89, 89, 90, 90, 91, 91, 93, 93, 94, 94, 95, 95, 96, 97, 98, 98, 99, 99, 100, 101, 102, 102, 103, 104, 105, 105, 106, 106, 107, 108, 109, 109, 110, 111, 111, 112, 113, 114, 114, 115, 116, 117, 117, 118, 119, 119, 121, 121, 122, 122, 123, 124, 125, 126, 126, 127, 128, 129, 129, 130, 131, 132, 132, 133, 134, 134, 135, 136, 137, 137, 138, 139, 140, 140, 141, 142, 142, 143, 144, 145, 145, 146, 146, 148, 148, 149, 149, 150, 151, 152, 152, 153, 153, 154, 155, 156, 156, 157, 157, 158, 159, 160, 160, 161, 161, 162, 162, 163, 164, 164, 165, 165, 166, 166, 167, 168, 168, 169, 169, 170, 170, 171, 172, 172, 173, 173, 174, 174, 175, 176, 176, 177, 177, 177, 178, 178, 179, 180, 180, 181, 181, 181, 182, 182, 183, 184, 184, 184, 185, 185, 186, 186, 186, 187, 188, 188, 188, 189, 189, 189, 190, 190, 191, 191, 192, 192, 193, 193, 193, 194, 194, 194, 195, 196, 196, 196, 197, 197, 197, 198, 199],
        vintage: function (node) {
            var node = node || document.querySelector("img.element-current");
            if (node === null) {
                return false;
            }
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            mw.image.preload(node.src, function (w, h) {
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(node, 0, 0);
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height), l = imageData.data.length, i = 0;
                for (; i < l; i += 4) {
                    imageData.data[i] = mw.image.vr[imageData.data[i]];
                    imageData.data[i + 1] = mw.image.vg[imageData.data[i + 1]];
                    imageData.data[i + 2] = mw.image.vb[imageData.data[i + 2]];
                    if (noise > 0) {
                        var noise = Math.round(noise - Math.random() * noise), j = 0;
                        for (; j < 3; j++) {
                            var iPN = noise + imageData.data[i + j];
                            imageData.data[i + j] = (iPN > 255) ? 255 : iPN;
                        }
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                node.src = canvas.toDataURL();
                if (!!mw.wysiwyg) mw.wysiwyg.normalizeBase64Image(node);
                mw.$(canvas).remove()
            });
        },
        _dragActivated: false,
        _dragcurrent: null,
        _dragparent: null,
        _dragcursorAt: {x: 0, y: 0},
        _dragTxt: function (e) {
            if (mw.image._dragcurrent !== null) {
                mw.image._dragcursorAt.x = e.pageX - mw.image._dragcurrent.offsetLeft;
                mw.image._dragcursorAt.y = e.pageY - mw.image._dragcurrent.offsetTop;
                var x = e.pageX - mw.image._dragparent.offsetLeft - mw.image._dragcurrent.startedX - mw.image._dragcursorAt.x;
                var y = e.pageY - mw.image._dragparent.offsetTop - mw.image._dragcurrent.startedY - mw.image._dragcursorAt.y;
                mw.image._dragcurrent.style.top = y + 'px';
                mw.image._dragcurrent.style.left = x + 'px';
            }
        }
    };

    for (var i in image) {
        mw.image[i] = image[i]
    };
})()

})();

(() => {
/*!************************************************!*\
  !*** ../tools/system-tools/modules-dialogs.js ***!
  \************************************************/
(function(){
    var systemDialogs = {
        moduleFrame: function(type, params, autoHeight){
            if(typeof autoHeight === 'undefined') {
                autoHeight = true;
            }
            params = params || {};
            if(!type) return;

            var frame = document.createElement('iframe');
            frame.className = 'mw-editor-frame';
            frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
            frame.allowFullscreen = true;
            frame.scrolling = "yes";
            frame.width = "100%";
            frame.frameBorder = "0";
            frame.src = mw.external_tool('module') + '?type=' + type + '&params=' + $.param(params).split('&').join(',');
            if(autoHeight) {
                mw.tools.iframeAutoHeight(frame)
            }
            return frame;
        },
          confirm_reset_module_by_id: function (module_id) {
        if (confirm("Are you sure you want to reset this module?")) {
            var is_a_preset = mw.$('#'+module_id).attr('data-module-original-id');
            var is_a_preset_attrs = mw.$('#'+module_id).attr('data-module-original-attrs');
            if(is_a_preset){
                var orig_attrs_decoded = JSON.parse(window.atob(is_a_preset_attrs));
                if (orig_attrs_decoded) {
                    mw.$('#'+module_id).removeAttr('data-module-original-id');
                    mw.$('#'+module_id).removeAttr('data-module-original-attrs');
                    mw.$('#'+module_id).attr(orig_attrs_decoded).reload_module();

                    if(  mw.top().win.module_settings_modal_reference_preset_editor_thismodal ){
                        mw.top().win.module_settings_modal_reference_preset_editor_thismodal.remove();
                    }
                 }
                 return;
            }

            var data = {};
            data.modules_ids = [module_id];

            var childs_arr = [];

            mw.$('#'+module_id).andSelf().find('.edit').each(function (i) {
                var some_child = {};

                mw.tools.removeClass(this, 'changed')
                some_child.rel = mw.$(this).attr('rel');
                some_child.field = mw.$(this).attr('field');

                childs_arr.push(some_child);

            });


            window.mw.on.DOMChangePause = true;

            if (childs_arr.length) {
                $.ajax({
                    type: "POST",
                   // dataType: "json",
                    //processData: false,
                    url: mw.settings.api_url + "content/reset_edit",
                    data: {reset:childs_arr}
                  //  success: success,
                  //  dataType: dataType
                });
           }


           //data-module-original-attrs

            $.ajax({
                type: "POST",
                // dataType: "json",
                //processData: false,
                url: mw.settings.api_url + "content/reset_modules_settings",
                data: data,
                success: function(){

                    setTimeout(function () {


                        mw.$('#'+module_id).removeAttr('data-module-original-id');
                        mw.reload_module('#'+module_id);
                        window.mw.on.DOMChangePause = false;

                    }, 1000);

                 },
            });
        }
    },
    open_reset_content_editor: function (root_element_id) {

        var src = mw.settings.site_url + 'api/module?id=mw_global_reset_content_editor&live_edit=true&module_settings=true&type=editor/reset_content&autosize=true';

        if(typeof(root_element_id) != 'undefined') {
            var src = src + '&root_element_id='+root_element_id;
        }

        // mw.dialogIframe({
        var modal = mw.dialogIframe({
            url: src,
            // width: 500,
            // height: mw.$(window).height() - (2.5 * mw.tools.TemplateSettingsModalDefaults.top),
            name: 'mw-reset-content-editor-front',
            title: 'Reset content',
            template: 'default',
            center: false,
            resize: true,
            autosize: true,
            autoHeight: true,
            draggable: true
        });
    },
    open_global_module_settings_modal: function (module_type, module_id, modalOptions, additional_params) {


        var params = {};
        params.id = module_id;
        params.live_edit = true;
        params.module_settings = true;
        params.type = module_type;
        params.autosize = false;

        var params_url = $.extend({}, params, additional_params);

        var src = mw.settings.site_url + "api/module?" + json2url(params_url);


        modalOptions = modalOptions || {};

        var defaultOpts = {
            url: src,
            // width: 500,
            height: 'auto',
            autoHeight: true,
            name: 'mw-module-settings-editor-front',
            title: 'Settings',
            template: 'default',
            center: false,
            resize: true,
            draggable: true
        };

        var settings = $.extend({}, defaultOpts, modalOptions);

        // return mw.dialogIframe(settings);
        return mw.top().dialogIframe(settings);
    },
    open_module_modal: function (module_type, params, modalOptions) {

        var id = mw.id('module-modal-');
        var id_content = id + '-content';
        modalOptions = modalOptions || {};

        var settings = $.extend({}, {
            content: '<div class="module-modal-content" id="' + id_content + '"></div>',
            id: id
        }, modalOptions, {skin: 'default'});

        var xhr = false;
        var openiframe = false;
        if (typeof (settings.iframe) != 'undefined' && settings.iframe) {
            openiframe = true;
        }
        if (openiframe) {

            var additional_params = {};
            additional_params.type = module_type;
            var params_url = $.extend({}, params, additional_params);
            var src = mw.settings.site_url + "api/module?" + json2url(params_url);


            var settings = {
                url: src,
                name: 'mw-module-settings-editor-front',
                title: 'Settings',
                center: false,
                resize: true,
                draggable: true,
                height:'auto',
                autoHeight: true
            };
            return mw.top().dialogIframe(settings);

        } else {
            delete settings.skin;
            delete settings.template;
            settings.height = 'auto';
            settings.autoHeight = true;
            settings.encapsulate = false;
            var modal = mw.dialog(settings);
            xhr = mw.load_module(module_type, '#' + id_content, function(){
                setTimeout(function(){
                    modal.center();
                },333)
            }, params);
        }


        return {
            xhr: xhr,
            modal: modal,
        }
    }
    };

    for (var i in systemDialogs) {
        mw.tools[i] = systemDialogs[i];
    }
})()

})();

(() => {
/*!***************************************!*\
  !*** ../tools/widgets/colorpicker.js ***!
  \***************************************/
mw._colorPickerDefaults = {
    skin: 'mw-tooltip-default',
    position: 'bottom-center',
    onchange: false
};

mw._colorPicker = function (options) {
    mw.lib.require('colorpicker');
    if (!mw.tools.colorPickerColors) {
        mw.tools.colorPickerColors = [];

        // var colorpicker_els = mw.top().$("body *");
        // if(colorpicker_els.length > 0){
        //     colorpicker_els.each(function () {
        //         var css = parent.getComputedStyle(this, null);
        //         if (css !== null) {
        //             if (mw.tools.colorPickerColors.indexOf(css.color) === -1) {
        //                 mw.tools.colorPickerColors.push(mw.color.rgbToHex(css.color));
        //             }
        //             if (mw.tools.colorPickerColors.indexOf(css.backgroundColor) === -1) {
        //                 mw.tools.colorPickerColors.push(mw.color.rgbToHex(css.backgroundColor));
        //             }
        //         }
        //     });
        // }

    }
    var proto = this;
    if (!options) {
        return false;
    }

    var settings = $.extend({}, mw._colorPickerDefaults, options);

    if (settings.element === undefined || settings.element === null) {
        return false;
    }



    var $el = mw.$(settings.element);
    if ($el[0] === undefined) {
        return false;
    }
    if($el[0].mwcolorPicker) {
        return $el[0].mwcolorPicker;
    }


    $el[0].mwcolorPicker = this;
    this.element = $el[0];
    if ($el[0].mwToolTipBinded !== undefined) {
        return false;
    }
    if (!settings.method) {
        if (this.element.nodeName === 'DIV') {
            settings.method = 'inline';
        }
    }
    this.settings = settings;

    $el[0].mwToolTipBinded = true;
    var sett = {
        showAlpha: true,
        showHSL: false,
        showRGB: false,
        showHEX: true,
        palette: mw.tools.colorPickerColors
    };

    if(settings.value) {
        sett.color = settings.value
    }
    if(typeof settings.showRGB !== 'undefined') {
        sett.showRGB = settings.showRGB
    }
    if(typeof settings.showHEX !== 'undefined') {
        sett.showHEX = settings.showHEX
    }

    if(typeof settings.showHSL !== 'undefined') {
        sett.showHSL = settings.showHSL
    }
    var frame;
    if (settings.method === 'inline') {

        sett.attachTo = $el[0];

        frame = AColorPicker.createPicker(sett);
        frame.onchange = function (data) {

            if (proto.settings.onchange) {
                proto.settings.onchange(data.color);
            }

            if ($el[0].nodeName === 'INPUT') {
                var val = val === 'transparent' ? val : '#' + val;
                $el.val(val);
            }
        }

    }
    else {
        var tip = mw.tooltip(settings), $tip = mw.$(tip).hide();
        this.tip = tip;

        mw.$('.mw-tooltip-content', tip).empty();
        sett.attachTo = mw.$('.mw-tooltip-content', tip)[0]

        frame = AColorPicker.createPicker(sett);

        frame.onchange = function (data) {

            if(frame.pause) {
                return;
            }

            if (proto.settings.onchange) {
                proto.settings.onchange(data.color);
            }

            if ($el[0].nodeName === 'INPUT') {
                $el.val(data.color);
            }
        };
        if ($el[0].nodeName === 'INPUT') {
            $el.on('focus', function (e) {
                if(this.value.trim()){
                    frame.pause = true;
                    frame.color = this.value;
                    setTimeout(function () {
                        frame.pause = false;
                    });
                }
                mw.$(tip).show();
                mw.tools.tooltip.setPosition(tip, $el[0], settings.position)
            });
        }
        else {
            $el.on('click', function (e) {
                mw.$(tip).toggle();
                mw.tools.tooltip.setPosition(tip, $el[0], settings.position)
            });
        }
        var documents = [document];
        if (self !== top){
            documents.push(top.document);
        }
        mw.$(documents).on('click', function (e) {
            if (!mw.tools.hasParentsWithClass(e.target, 'mw-tooltip') && e.target !== $el[0]) {
                mw.$(tip).hide();
            }
        });
        if ($el[0].nodeName === 'INPUT') {
            $el.bind('blur', function () {
                //$(tip).hide();
            });
        }
    }
    if (this.tip) {
        this.show = function () {
            mw.$(this.tip).show();
            mw.tools.tooltip.setPosition(this.tip, this.settings.element, this.settings.position)
        };
        this.hide = function () {
            mw.$(this.tip).hide()
        };
        this.toggle = function () {
            var tip = mw.$(this.tip);
            if (tip.is(':visible')) {
                this.hide()
            }
            else {
                $el.focus();
                this.show()
            }
        }
    }

};
mw.colorPicker = function (o) {

    return new mw._colorPicker(o);
};

})();

(() => {
/*!**********************************!*\
  !*** ../tools/widgets/dialog.js ***!
  \**********************************/
(function (mw) {



    mw.dialog = function (options) {
        return new mw.Dialog(options);
    };


    mw.dialogIframe = function (options, cres) {
        options.pauseInit = true;
        var attr = 'frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen';
        if (options.autoHeight) {
            attr += ' scrolling="no"';
            options.height = 'auto';
        }
        options.content = '<iframe src="' + mw.external_tool(options.url.trim()) + '" ' + attr + '><iframe>';
        options.className = ('mw-dialog-iframe mw-dialog-iframe-loading ' + (options.className || '')).trim();
        options.className += (options.autoHeight ? ' mw-dialog-iframe-autoheight' : '');
        var dialog = new mw.Dialog(options, cres);
        dialog.iframe = dialog.dialogContainer.querySelector('iframe');
        mw.tools.loading(dialog.dialogContainer, 90);



        setTimeout(function () {
            var frame = dialog.dialogContainer.querySelector('iframe');
            frame.style.minHeight = 0; // reset in case of conflicts
            if (options.autoHeight) {
                mw.tools.iframeAutoHeight(frame, {dialog: dialog});
            } else{
                $(frame).height(options.height - 60);
                frame.style.position = 'relative';
            }
            mw.$(frame).on('load', function () {
                mw.tools.loading(dialog.dialogContainer, false);
                setTimeout(function () {
                    dialog.center();
                    mw.$(frame).on('bodyResize', function () {
                        dialog.center();
                    });
                    dialog.dialogMain.classList.remove('mw-dialog-iframe-loading');
                    frame.contentWindow.thismodal = dialog;
                    if (options.autoHeight) {
                        mw.tools.iframeAutoHeight(frame, {dialog: dialog});
                    }
                }, 78);
                if (mw.tools.canAccessIFrame(frame)) {
                    mw.$(frame.contentWindow.document).on('keydown', function (e) {
                        if (mw.event.is.escape(e) && !mw.event.targetIsField(e)) {
                            if(mw.top().__dialogs && mw.top().__dialogs.length){
                                var dlg = mw.top().__dialogs;
                                dlg[dlg.length - 1]._doCloseButton();
                                $(dlg[dlg.length - 1]).trigger('closedByUser');
                            }
                            else {
                                if (dialog.options.closeOnEscape) {
                                    dialog._doCloseButton();
                                    $(dialog).trigger('closedByUser');
                                }
                            }
                        }
                    });
                }
                if(typeof options.onload === 'function') {
                    options.onload.call(dialog);
                }
            });
        }, 12);
        return dialog;
    };

    /** @deprecated */
    mw.modal = mw.dialog;
    mw.modalFrame = mw.dialogIframe;

    mw.dialog.remove = function (selector) {
        return mw.dialog.get(selector).remove();
    };

    mw.dialog.get = function (selector) {
        selector = selector || '.mw-dialog';
        var $el = mw.$(selector);
        var el = $el[0];

        if(!el) return false;

        if(el._dialog) {
            return el._dialog;
        }
        var child_cont = el.querySelector('.mw-dialog-holder');
        var parent_cont = $el.parents(".mw-dialog-holder:first");
        if (child_cont) {
            return child_cont._dialog;
        }
        else if (parent_cont.length !== 0) {
            return parent_cont[0]._dialog;
        }
        else if (window.thismodal) {
            return thismodal;
        }
        else {
             // deprecated
            child_cont = el.querySelector('.mw_modal');
            parent_cont = $el.parents(".mw_modal:first");
            if(child_cont) {
                return child_cont.modal;
            } else if (parent_cont.length !== 0) {
                return parent_cont[0].modal;
            }
            return false;
        }
    };


    mw.Dialog = function (options, cres) {

        var scope = this;

        options = options || {};
        options.content = options.content || options.html || '';

        if(!options.height && typeof options.autoHeight === 'undefined') {
            options.height = 'auto';
            options.autoHeight = true;
        }

        var defaults = {
            skin: 'default',
            overlay: true,
            overlayClose: false,
            autoCenter: true,
            root: document,
            id: mw.id('mw-dialog-'),
            content: '',
            closeOnEscape: true,
            closeButton: true,
            closeButtonAppendTo: '.mw-dialog-header',
            closeButtonAction: 'remove', // 'remove' | 'hide'
            draggable: true,
            scrollMode: 'inside', // 'inside' | 'window',
            centerMode: 'intuitive', // 'intuitive' | 'center'
            containment: 'window',
            overflowMode: 'auto', // 'auto' | 'hidden' | 'visible'
        };

        this.options = $.extend({}, defaults, options, {
            skin: 'default'
        });

        this.id = this.options.id;
        var exist = document.getElementById(this.id);
        if (exist) {
            return exist._dialog;
        }

        this.hasBeenCreated = function () {
            return this.options.root.getElementById(this.id) !== null;
        };

        if (this.hasBeenCreated()) {
            return this.options.root.getElementById(this.id)._dialog;
        }

        if(!mw.top().__dialogs ) {
            mw.top().__dialogs = [];
        }
        if (!mw.top().__dialogsData) {
            mw.top().__dialogsData = {};
        }


        if (!mw.top().__dialogsData._esc) {
            mw.top().__dialogsData._esc = true;
            mw.$(document).on('keydown', function (e) {
                if (mw.event.is.escape(e)) {
                    var dlg = mw.top().__dialogs[mw.top().__dialogs.length - 1];
                    if (dlg && dlg.options && dlg.options.closeOnEscape) {
                        dlg._doCloseButton();
                    }
                }
            });
        }

        mw.top().__dialogs.push(this);

        this.draggable = function () {
            if (this.options.draggable && $.fn.draggable) {
                var $holder = mw.$(this.dialogHolder);
                $holder.draggable({
                    handle: this.options.draggableHandle || '.mw-dialog-header',
                    start: function () {
                        $holder.addClass('mw-dialog-drag-start');
                        scope._dragged = true;
                    },
                    stop: function () {
                        $holder.removeClass('mw-dialog-drag-start');
                    },
                    containment: scope.options.containment,
                    iframeFix: true
                });
            }
        };

        this.header = function () {
            this.dialogHeader = this.options.root.createElement('div');
            this.dialogHeader.className = 'mw-dialog-header';
            if (this.options.title || this.options.header) {
                this.dialogHeader.innerHTML = '<div class="mw-dialog-title">' + (this.options.title || this.options.header) + '</div>';
            }
        };

        this.footer = function (content) {
            this.dialogFooter = this.options.root.createElement('div');
            this.dialogFooter.className = 'mw-dialog-footer';
            if (this.options.footer) {
                $(this.dialogFooter).append(this.options.footer);
            }
        };

        this.title = function (title) {
            var root = mw.$('.mw-dialog-title', this.dialogHeader);
            if (typeof title === 'undefined') {
                return root.html();
            } else {
                if (root[0]) {
                    root.html(title);
                }
                else {
                    mw.$(this.dialogHeader).prepend('<div class="mw-dialog-title">' + title + '</div>');
                }
            }
        };


        this.build = function () {
            this.dialogMain = this.options.root.createElement('div');

            this.dialogMain.id = this.id;
            var cls = 'mw-dialog mw-dialog-scroll-mode-' + this.options.scrollMode
                + ' mw-dialog-skin-' + this.options.skin
                + ' mw-dialog-overflowMode-' + this.options.overflowMode;
            cls += (!this.options.className ? '' : (' ' + this.options.className));
            this.dialogMain.className = cls;
            this.dialogMain._dialog = this;

            this.dialogHolder = this.options.root.createElement('div');
            this.dialogHolder.id = 'mw-dialog-holder-' + this.id;


            this.dialogHolder._dialog = this;

            this.header();
            this.footer();
            this.draggable();



            this.dialogContainer = this.options.root.createElement('div');
            this.dialogContainer._dialog = this;

            // TODO: obsolate
            this.container = this.dialogContainer;


            this.dialogContainer.className = 'mw-dialog-container';
            this.dialogHolder.className = 'mw-dialog-holder';

            var cont = this.options.content;
            if(this.options.shadow) {
                this.shadow = this.dialogContainer.attachShadow({
                    mode: 'open'
                });
                if(typeof cont === 'string') {
                    this.shadow.innerHTML = (cont);
                } else {
                    this.shadow.appendChild(cont);
                }
            } else {
                mw.$(this.dialogContainer).append(cont);
            }


            if (this.options.encapsulate) {
                this.iframe = cont;
                this.iframe.style.display = '';
            }

            this.dialogHolder.appendChild(this.dialogHeader);
            this.dialogHolder.appendChild(this.dialogContainer);
            this.dialogHolder.appendChild(this.dialogFooter);

            this.closeButton = this.options.root.createElement('div');
            this.closeButton.className = 'mw-dialog-close';

            this.closeButton.$scope = this;

            this.closeButton.onclick = function () {
                this.$scope[this.$scope.options.closeButtonAction]();
                $(this.$scope).trigger('closedByUser');
            };
            this.main = mw.$(this.dialogContainer); // obsolete
            this.main.width = this.width;

            this.width(this.options.width || 600);
            this.height(this.options.height || 320);

            this.options.root.body.appendChild(this.dialogMain);
            this.dialogMain.appendChild(this.dialogHolder);
            if (this.options.closeButtonAppendTo) {
                mw.$(this.options.closeButtonAppendTo, this.dialogMain).append(this.closeButton)
            }
            else {
                this.dialogHolder.appendChild(this.closeButton);

            }
            this.dialogOverlay();
            return this;
        };

        this._doCloseButton = function() {
            this[this.options.closeButtonAction]();
        };

        this.containmentManage = function () {
            if (scope.options.containment === 'window') {
                if (scope.options.scrollMode === 'inside') {
                    var rect = this.dialogHolder.getBoundingClientRect();
                    var $win = mw.$(window);
                    var sctop = $win.scrollTop();
                    var height = $win.height();
                    if (rect.top < sctop || (sctop + height) > (rect.top + rect.height)) {
                        this.center();
                    }
                }
            }
        };

        this.dialogOverlay = function () {
            this.overlay = this.options.root.createElement('div');
            this.overlay.className = 'mw-dialog-overlay';
            this.overlay.$scope = this;
            if (this.options.overlay === true) {
                this.dialogMain.appendChild(this.overlay);
            }
            mw.$(this.overlay).on('click', function () {
                if (this.$scope.options.overlayClose === true) {
                    this.$scope._doCloseButton();
                    $(this.$scope).trigger('closedByUser');
                }
            });
            return this;
        };

        this._afterSize = function() {
            if(mw._iframeDetector) {
                mw._iframeDetector.pause = true;
                var frame = window.frameElement;
                if(frame && parent !== top){
                    var height = this.dialogContainer.scrollHeight + this.dialogHeader.scrollHeight;
                    if($(frame).height() < height) {
                        frame.style.height = ((height + 100) - this.dialogHeader.offsetHeight - this.dialogFooter.offsetHeight) + 'px';
                        if(window.thismodal){
                            thismodal.height(height + 100);
                        }

                    }
                }
            }
        };

        this.show = function () {
            mw.$(this.dialogMain).find('iframe').each(function(){
                this._intPause = false;
            });
            mw.$(this.dialogMain).addClass('active');
            this.center();
            this._afterSize();
            mw.$(this).trigger('Show');
            mw.trigger('mwDialogShow', this);
            return this;
        };

        this._hideStart = false;
        this.hide = function () {
            if (!this._hideStart) {
                this._hideStart = true;
                mw.$(this.dialogMain).find('iframe').each(function(){
                    this._intPause = true;
                });
                setTimeout(function () {
                    scope._hideStart = false;
                }, 300);
                mw.$(this.dialogMain).removeClass('active');
                if(mw._iframeDetector) {
                    mw._iframeDetector.pause = false;
                }
                mw.$(this).trigger('Hide');
                mw.trigger('mwDialogHide', this);
            }
            return this;
        };

        this.remove = function () {
            this.hide();
            mw.removeInterval('iframe-' + this.id);
            mw.$(this).trigger('BeforeRemove');
            if (typeof this.options.beforeRemove === 'function') {
                this.options.beforeRemove.call(this, this)
            }
            mw.$(this.dialogMain).remove();
            if(this.options.onremove) {
                this.options.onremove()
            }
            mw.$(this).trigger('Remove');
            mw.trigger('mwDialogRemove', this);
            for (var i = 0; i < mw.top().__dialogs.length; i++) {
                if (mw.top().__dialogs[i] === this) {
                    mw.top().__dialogs.splice(i, 1);
                    break;
                }
            }
            return this;
        };

        this.destroy = this.remove;

        this._prevHeight = -1;
        this._dragged = false;

        this.center = function (width, height) {
            var $holder = mw.$(this.dialogHolder), $window = mw.$(window);
            var holderHeight = height || $holder.outerHeight();
            var holderWidth = width || $holder.outerWidth();
            var dtop, css = {};

            if (this.options.centerMode === 'intuitive' && this._prevHeight < holderHeight) {
                dtop = $window.height() / 2 - holderHeight / 2;
            } else if (this.options.centerMode === 'center') {
                dtop = $window.height() / 2 - holderHeight / 2;
            }

            if (!scope._dragged) {
                css.left = $window.outerWidth() / 2 - holderWidth / 2;
            } else {
                css.left = parseFloat($holder.css('left'));
            }

            if(css.left + holderWidth > $window.width()){
                css.left = css.left - ((css.left + holderWidth) - $window.width());
            }

            if (dtop) {
                css.top = dtop > 0 ? dtop : 0;
            }

            if(window !== mw.top().win && document.body.scrollHeight > mw.top().win.innerHeight){
                $win = $(mw.top());

                css.top = $(document).scrollTop() + 50;
                var off = $(window.frameElement).offset();
                if(off.top < 0) {
                    css.top += Math.abs(off.top);
                }
                if(window.thismodal) {
                    css.top += thismodal.dialogContainer.scrollTop;
                }

            }


            $holder.css(css);
            this._prevHeight = holderHeight;


            this._afterSize();
            mw.$(this).trigger('dialogCenter');

            return this;
        };

        this.width = function (width) {
            if(!width) {
                return mw.$(this.dialogHolder).outerWidth();
            }
            mw.$(this.dialogHolder).width(width);
            this._afterSize();
        };
        this.height = function (height) {
            if(!height) {
                return mw.$(this.dialogHolder).outerHeight();
            }
            mw.$(this.dialogHolder).height(height);
            this._afterSize();
        };
        this.resize = function (width, height) {
            if (typeof width !== 'undefined') {
                this.width(width);
            }
            if (typeof height !== 'undefined') {
                this.height(height);
            }
            this.center(width, height);
        };
        this.content = function (content) {
            this.options.content = content || '';
            $(this.dialogContainer).empty().append(this.options.content);
            return this;
        };

        this.result = function(result, doClose) {
            this.value = result;
            if(this.options.onResult){
                this.options.onResult.call( this, result );
            }
            if (cres) {
                cres.call( this, result );
            }
            $(this).trigger('Result', [result]);
            if(doClose){
                this._doCloseButton();
            }
        };


        this.contentMaxHeight = function () {
            var scope = this;
            if (this.options.scrollMode === 'inside') {
                mw.interval('iframe-' + this.id, function () {
                    var max = mw.$(window).height() - scope.dialogHeader.clientHeight - scope.dialogFooter.clientHeight - 40;
                    scope.dialogContainer.style.maxHeight = max + 'px';
                    scope.containmentManage();
                });
            }
        };
        this.init = function () {
            this.build();
            this.contentMaxHeight();
            this.center();
            this.show();
            if (this.options.autoCenter) {
                (function (scope) {
                    mw.$(window).on('resize orientationchange load', function () {
                        scope.contentMaxHeight();
                        scope.center();
                    });
                })(this);
            }
            if (!this.options.pauseInit) {
                mw.$(this).trigger('Init');
            }
            setTimeout(function(){
                scope.center();
                setTimeout(function(){
                    scope.center();
                    setTimeout(function(){
                        scope.center();
                    }, 3000);
                }, 333);
            }, 78);


            return this;
        };
        this.init();

    };

    mw.Dialog.elementIsInDialog = function (node) {
        return mw.tools.firstParentWithClass(node, 'mw-dialog');
    };




})(window.mw);


(function () {
    function scoped() {
        var all = document.querySelectorAll('style[scoped]'), i = 0;

        try {
            for( ; i < all.length; i++ ) {
                var parent = all[i].parentNode;
                parent.id = parent.id || mw.id('scoped-id-');
                var prefix = '#' + parent.id + ' ';
                var rules = all[i].sheet.rules;
                var r = 0;
                for ( ; r < rules.length; r++) {
                    var newRule = prefix + rules[r].cssText;
                    all[i].sheet.deleteRule(r);
                    all[i].sheet.insertRule(newRule, r);
                }
                all[i].removeAttribute('scoped');
            }
        }
        catch(error) {

        }


    }
    scoped();
    $(window).on('load', function () {
        scoped();
    });
})();



})();

(() => {
/*!***************************************!*\
  !*** ../tools/widgets/elementedit.js ***!
  \***************************************/
mw.tools.elementEdit = function (el, textonly, callback, fieldClass) {
    if (!el || el.querySelector('.mw-live-edit-input') !== null) {
        return;
    }
    textonly = (typeof textonly === 'undefined') ? true : textonly;
    var input = document.createElement('span');
    input.className = (fieldClass || "") + ' mw-live-edit-input mw-liveedit-field';
    input.contentEditable = true;
    var $input = $(input);
    if (textonly === true) {
        input.innerHTML = el.textContent;
        input.onblur = function () {
            var val = $input.text();
            var ischanged = true;
            setTimeout(function () {
                mw.$(el).text(val);
                if (typeof callback === 'function' && ischanged) {
                    callback.call(val, el);
                }
            }, 3);
        };
        input.onkeydown = function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                mw.$(el).text($input.text());
                if (typeof callback === 'function') {
                    callback.call($input.text(), el);
                }
                return false;
            }
        }
    }
    else {
        input.innerHTML = el.innerHTML;
        input.onblur = function () {
            var val = this.innerHTML;
            var ischanged = this.changed === true;
            setTimeout(function () {
                el.innerHTML = val;
                if (typeof callback === 'function' && ischanged) {
                    callback.call(val, el);
                }
            }, 3)
        }
        input.onkeydown = function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                var val = this.innerHTML;
                el.innerHTML = val;
                if (typeof callback === 'function') {
                    callback.call(val, el);
                }
                return false;
            }
        }
    }
    mw.$(el).empty().append(input);
    $input.focus();
    input.changed = false;
    $input.change(function () {
        this.changed = true;
    });
    return input;
}

})();

(() => {
/*!***********************************!*\
  !*** ../tools/widgets/gallery.js ***!
  \***********************************/
(function(){
    mw.require('modal.css');

    var Gallery = function (array, startFrom) {
        startFrom = startFrom || 0;

        this.currentIndex = startFrom;

        this.data = array;
        var scope = this;

        this._template = function () {
            var el = document.createElement('div');
            el.className = 'mw-gallery';
            el.innerHTML = '' +
            '<div class="">' +
                '<div class="mw-gallery-overlay"></div>' +
                '<div class="mw-gallery-content"></div>' +
                '<div class="mw-gallery-prev"></div>' +
                '<div class="mw-gallery-next"></div>' +
                '<div class="mw-gallery-controls">' +
                    '<span class="mw-gallery-control-play"></span>' +
                    /*'<span class="mw-gallery-control-fullscreen"></span>' +*/
                    '<span class="mw-gallery-control-close"></span>' +
                '</div>' +
            '</div>';
            return el;
        };

        this.createSingle = function (item, i) {
            var el = document.createElement('div');
            el.className = 'mw-gallery-item mw-gallery-item-' + i + (startFrom === i ? ' active' : '');
            var desc = !item.description ? '' : '<div class="mw-gallery-item-description">'+item.description+'</div>';
            el.innerHTML = '<div class="mw-gallery-item-image"><img src="'+(item.image || item.url || item.src)+'"></div>' + desc;
            this.container.appendChild(el);
            return el;
        };

        this.next = function () {
            this.currentIndex++;
            if(!this._items[this.currentIndex]) {
                this.currentIndex = 0;
            }
            this.goto(this.currentIndex);
        };

        this.prev = function () {
            this.currentIndex--;
            if(!this._items[this.currentIndex]) {
                this.currentIndex = this._items.length - 1;
            }
            this.goto(this.currentIndex);
        };

        this.goto = function (i) {
            if(i > -1 && i < this._items.length) {
                this.currentIndex = i;
                this._items.forEach(function (item, i){
                    item.classList.remove('active');
                    if(i === scope.currentIndex) {
                        item.classList.add('active');
                    }
                });
            }
        };

        this.paused = true;

        this.pause = function () {
            this.paused = true;
            clearTimeout(this.playInterval);
            mw.tools.loading(this.template, false, );
        };

        this.playInterval = null;
        this._play = function () {
            if(this.paused) return;
            mw.tools.loading(this.template, 100, 'slow');
            this.playInterval = setTimeout(function (){
                mw.tools.loading(scope.template, 'hide');
                scope.next();
                scope._play();
            },5000);
        };

        this.play = function () {
            this.next();
            this.paused = false;
            this._play();
        };

        this._items = [];

        this.createHandles = function () {
            this.template.querySelector('.mw-gallery-prev').onclick = function (){ scope.pause(); scope.prev(); };
            this.template.querySelector('.mw-gallery-next').onclick = function (){ scope.pause(); scope.next(); };
            this.template.querySelector('.mw-gallery-control-close').onclick = function (){ scope.remove(); };
            this.template.querySelector('.mw-gallery-control-play').onclick = function (){
                scope[scope.paused ? 'play' : 'pause']();
                this.classList[scope.paused ? 'remove' : 'add']('pause');
            };
        };

        this.createItems = function () {
            this.data.forEach(function (item, i ){
                scope._items.push(scope.createSingle(item, i));
            });
        };

        this.init = function () {
            this.template = this._template();
            document.body.appendChild(this.template);
            this.container = this.template.querySelector('.mw-gallery-content');
            this.createItems();
            this.createHandles();
        };

        this.remove = function () {
            this.template.remove();
        };

        this.init();
    };

    mw.gallery = function (array, startFrom){
        return new Gallery(array, startFrom);
    };

    // obsolate:
    mw.tools.gallery = {
        init: mw.gallery
    };
})();

})();

(() => {
/*!****************************************!*\
  !*** ../tools/widgets/iframe-tools.js ***!
  \****************************************/
mw.tools.createAutoHeight = function() {
    if(window.thismodal && thismodal.iframe) {
        mw.tools.iframeAutoHeight(thismodal.iframe);
    }
    else if(mw.top().win.frameElement && mw.top().win.frameElement.contentWindow === window) {
        mw.tools.iframeAutoHeight(mw.top().win.frameElement);
    } else if(window.top !== window) {
        mw.top().$('iframe').each(function(){
            try{
                if(this.contentWindow === window) {
                    mw.tools.iframeAutoHeight(this);
                }
            } catch(e){}
        })
    }
};

mw.tools.moduleFrame = function(type, template){
    return mw.dialogIframe({
        url: mw.external_tool('module_dialog') + '?module=' + type + (template ? ('&template=' + template) : ''),
        width: 532,
        height: 'auto',
        autoHeight:true,
        title: type,
        className: 'mw-dialog-module-settings',
        closeButtonAction: 'remove'
    });
};


mw.tools.iframeAutoHeight = function(frame, opt){

    frame = mw.$(frame)[0];
    if(!frame) return;

    var _detector = document.createElement('div');
    _detector.className = 'mw-iframe-auto-height-detector';
    _detector.id = mw.id();

    var insertDetector = function() {
        if(frame.contentWindow && frame.contentWindow.document && frame.contentWindow.document.body){
            var det = frame.contentWindow.document.querySelector('.mw-iframe-auto-height-detector');
            if(!det){
                frame.contentWindow.document.body.appendChild(_detector);
            } else if(det !== frame.contentWindow.document.body.lastChild){
                frame.contentWindow.document.body.appendChild(det);
            }
            if(frame.contentWindow.mw) {
                frame.contentWindow.mw._iframeDetector = _detector;
            }

        }
    };



    setTimeout(function(){
        insertDetector();
    }, 100);
    frame.scrolling="no";
    frame.style.minHeight = 0 + 'px';
    mw.$(frame).on('load resize', function(){

        if(!mw.tools.canAccessIFrame(frame)) {
            console.log('Iframe can not be accessed.', frame);
            return;
        }
        if(!frame.contentWindow.document.body){
            return;
        }
        if(!!frame.contentWindow.document.querySelector('.mw-iframe-auto-height-detector')){
            return;
        }
        insertDetector();
    });
    var offset = function () {
        return _detector.getBoundingClientRect().top;
    };
    frame._intPause = false;
    frame._int = setInterval(function(){
        if(!frame._intPause && frame.parentNode && frame.contentWindow && frame.contentWindow.document.body){
            var calc = offset() + _detector.offsetHeight;
            frame._currHeight = frame._currHeight || 0;
            if(calc && calc !== frame._currHeight ){
                frame._currHeight = calc;
                frame.style.height = Math.max(calc) + 'px';
                var scroll = Math.max(frame.contentWindow.document.documentElement.scrollHeight, frame.contentWindow.document.body.scrollHeight);
                if(scroll > frame._currHeight) {
                    frame._currHeight = scroll;
                    frame.style.height = scroll + 'px';
                }
                mw.$(frame).trigger('bodyResize');
            }
        } else if(!frame.parentElement){
            clearInterval(frame._int);
        }
        else {
            //clearInterval(frame._int);
        }
    }, 77);

};

})();

(() => {
/*!**************************************!*\
  !*** ../tools/widgets/responsive.js ***!
  \**************************************/
mw.responsive = {
    table: function (selector, options) {
        options = options || {};
        mw.$(selector).each(function () {
            var cls = 'responsive-table-' + mw.random();
            mw.tools.addClass(this, cls);
            var el = mw.$(this);
            el.wrap('<div class="mw-responsive-table-wrapper"></div>');
            if (options.minWidth) {
                el.css('minWidth', options.minWidth)
            }
            if (!el.hasClass('mw-mobile-table')) {
                el.addClass('mw-mobile-table');
            }
        });
    }
};

})();

(() => {
/*!**********************************!*\
  !*** ../tools/widgets/select.js ***!
  \**********************************/
/*
    options.data = [
        {
            title: string,
            value: any,
            icon?: string,
            selected?: boolean
        }
    ]

 */


mw.Select = function(options) {
    var defaults = {
        data: [],
        skin: 'default',
        multiple: false,
        autocomplete: false,
        mobileAutocomplete: false,
        showSelected: false,
        document: document,
        size: 'normal',
        color: 'default',
        dropMode: 'over', // 'over' | 'push'
        placeholder: mw.lang('Select'),
        tags: false, // only if multiple is set to true,
        ajaxMode: {
            paginationParam: 'page',
            searchParam: 'keyword',
            endpoint: null,
            method: 'get'
        }
    };
    options  = options || {};
    this.settings = $.extend({}, defaults, options);



    if(this.settings.ajaxMode && !this.settings.ajaxMode.endpoint){
        this.settings.ajaxMode = false;
    }

    this.$element = $(this.settings.element).eq(0);
    this.element = this.$element[0];
    if(!this.element) {
        return;
    }

    this._rootInputMode = this.element.nodeName === 'INPUT';

    if(this.element._mwSelect) {
        return this.element._mwSelect;
    }

    var scope = this;
    this.document = this.settings.document;

    this._value = null;


    this.getLabel = function(item) {
        return item.title || item.name || item.label || item.value;
    };

    this._loading = false;

    this._page = 1;

    this.nextPage = function () {
        this._page++;
    };

    this.page = function (state) {
        if (typeof state === 'undefined') {
            return this._page;
        }
        this._page = state;
    };

    this.loading = function (state) {
        if (typeof state === 'undefined') {
            return this._state;
        }
        this._state = state;
        mw.tools.classNamespaceDelete(this.root, 'mw-select-loading-');
        mw.tools.addClass(this.root, 'mw-select-loading-' + state);
    };

    this.xhr = null;

    this.ajaxFilter = function (val, callback) {
        if (this.xhr) {
            this.xhr.abort();
        }
        val = (val || '').trim().toLowerCase();
        var params = { };
        params[this.settings.ajaxMode.searchParam] = val;
        params = (this.settings.ajaxMode.endpoint.indexOf('?') === -1 ? '?' : '&' ) + $.param(params);
        this.xhr = $[this.settings.ajaxMode.method](this.settings.ajaxMode.endpoint + params, function (data) {
            callback.call(this, data);
            scope.xhr = null;
        });
    };

    this.filter = function (val) {
        val = (val || '').trim().toLowerCase();
        if (this.settings.ajaxMode) {
            this.loading(true);
            this.ajaxFilter(val, function (data) {
                scope.setData(data.data);
                if(data.data && data.data.length){
                    scope.open();
                } else {
                    scope.close();
                }
                scope.loading(false);
            });
        } else {
            var all = this.root.querySelectorAll('.mw-select-option'), i = 0;
            if (!val) {
                for( ; i< all.length; i++) {
                    all[i].style.display = '';
                }
            } else {
                for( ; i< all.length; i++) {
                    all[i].style.display = this.getLabel(all[i].$value).toLowerCase().indexOf(val) !== -1 ? '' : 'none';
                }
            }
        }
    };

    this.setPlaceholder = function (plval) {
        /*plval = plval || this.settings.placeholder;
        if(scope.settings.autocomplete){
            $('.mw-ui-invisible-field', this.root).attr('placeholder', plval);
        } else {
            $('.mw-ui-btn-content', this.root).html(plval);
        }*/
        return this.displayValue(plval)
    };
    this.displayValue = function(plval){
        if(!plval && !this.settings.multiple && this.value()) {
            plval = scope.getLabel(this.value());
        }
        plval = plval || this.settings.placeholder;
        if(!scope._displayValue) {
            scope._displayValue = scope.document.createElement('span');
            scope._displayValue.className = 'mw-select-display-value mw-ui-size-' + this.settings.size;
            $('.mw-select-value', this.root).append(scope._displayValue)
        }
        if(this._rootInputMode){
            scope._displayValue.innerHTML = '&nbsp';
            $('input.mw-ui-invisible-field', this.root).val(plval);

        } else {
            scope._displayValue.innerHTML = plval + this.__indicateNumber();

        }
    };

    this.__indicateNumber = function () {
        if(this.settings.multiple && this.value() && this.value().length){
            return "<span class='mw-select-indicate-number'>" + this.value().length + "</span>";
        } else {
            return "<span class='mw-select-indicate-number mw-select-indicate-number-empty'>" + 0 + "</span>";
        }
    };

    this.rend = {

        option: function(item){
            var oh = scope.document.createElement('label');
            oh.$value = item;
            oh.className = 'mw-select-option';
            if (scope.settings.multiple) {
                oh.className = 'mw-ui-check mw-select-option';
                oh.innerHTML =  '<input type="checkbox"><span></span><span>'+scope.getLabel(item)+'</span>';

                $('input', oh).on('change', function () {
                    this.checked ? scope.valueAdd(oh.$value) : scope.valueRemove(oh.$value)
                });
            } else {
                oh.innerHTML = scope.getLabel(item);
                oh.onclick = function () {
                    scope.value(oh.$value)
                };
            }

            return oh;
        },
        value: function() {
            var tag = 'span', cls = 'mw-ui-btn';
            if(scope.settings.autocomplete){
                tag = 'span';
                cls = 'mw-ui-field'
            }
            var oh = scope.document.createElement(tag);
            oh.className = cls + ' mw-ui-size-' + scope.settings.size + ' mw-ui-bg-' + scope.settings.color + ' mw-select-value';

            if(scope.settings.autocomplete){
                oh.innerHTML = '<input class="mw-ui-invisible-field mw-ui-field-' + scope.settings.size + '">';
            } else {
                oh.innerHTML = '<span class="mw-ui-btn-content"></span>';
            }

            if(scope.settings.autocomplete){
                $('input', oh)
                    .on('input focus', function () {
                        scope.filter(this.value);
                        if(scope._rootInputMode) {
                            scope.element.value = this.value;
                            $(scope.element).trigger('input change')
                        }
                    })
                    .on('focus', function () {
                        if(scope.settings.data && scope.settings.data.length) {
                            scope.open();
                        }
                    }).on('focus blur input', function () {
                    var hasVal = !!this.value.trim();
                    mw.tools[hasVal ? 'addClass' : 'removeClass'](scope.root, 'mw-select-has-value')
                });
            } else {
                oh.onclick = function () {
                    scope.toggle();
                };
            }
            return oh;
        },
        options: function(){
            scope.optionsHolder = scope.document.createElement('div');
            scope.holder = scope.document.createElement('div');
            scope.optionsHolder.className = 'mw-select-options';
            $.each(scope.settings.data, function(){
                scope.holder.appendChild(scope.rend.option(this))
            });
            scope.optionsHolder.appendChild(scope.holder);
            return scope.optionsHolder;
        },
        root: function () {
            scope.root = scope.document.createElement('div');
            scope.root.className = 'mw-select mw-select-dropmode-' + scope.settings.dropMode + ' mw-select-multiple-' + scope.settings.multiple;

            return scope.root;
        }
    };

    this.state = 'closed';

    this.open = function () {
        this.state = 'opened';
        mw.tools.addClass(scope.root, 'active');
        mw.Select._register.forEach(function (item) {
            if(item !== scope) {
                item.close()
            }
        });
    };

    this.close = function () {
        this.state = 'closed';
        mw.tools.removeClass(scope.root, 'active');
    };

    this.tags = function () {
        if(!this._tags) {
            if(this.settings.multiple && this.settings.tags) {
                var holder = scope.document.createElement('div');
                holder.className = 'mw-select-tags';
                this._tags = new mw.tags({element:holder, data:scope._value || [], color: this.settings.tagsColor, size: this.settings.tagsSize || 'small'})
                $(this.optionsHolder).prepend(holder);
                mw.$(this._tags).on('tagRemoved', function (e, tag) {
                    scope.valueRemove(tag)
                })
            }
        } else {
            this._tags.setData(scope._value)
        }
        this.displayValue()
    };


    this.toggle = function () {
        if (this.state === 'closed') {
            this.open();
        } else {
            this.close();
        }
    };


    this._valueGet = function (val) {
        if(typeof val === 'number') {
            val = this.settings.data.find(function (item) {
                return item.id === val;
            })
        }
        return val;
    };



    this.valueAdd = function(val){
        if (!val) return;
        val = this._valueGet(val);
        if (!val) return;
        if (!this._value) {
            this._value = []
        }
        var exists = this._value.find(function (item) {
            return item.id === val.id;
        });
        if (!exists) {
            this._value.push(val);
            $(this.root.querySelectorAll('.mw-select-option')).each(function () {
                if(this.$value === val) {
                    this.querySelector('input').checked = true;
                }
            });
        }

        this.afterChange();
    };

    this.afterChange = function () {
        this.tags();
        this.displayValue();
        if($.isArray(this._value)) {
            $.each(this._value, function () {

            });
            $(this.root.querySelectorAll('.mw-select-option')).each(function () {
                if(scope._value.indexOf(this.$value) !== -1) {
                    mw.tools.addClass(this, 'active')
                }
                else {
                    mw.tools.removeClass(this, 'active')
                }
            });
        }
        $(this).trigger('change', [this._value]);
    };

    this.valueRemove = function(val) {
        if (!val) return;
        val = this._valueGet(val);
        if (!val) return;
        if (!this._value) {
            this._value = [];
        }
        var exists = this._value.find(function (item) {
            return item.id === val.id;
        });
        if (exists) {
            this._value.splice(this._value.indexOf(exists), 1);
        }
        $(this.root.querySelectorAll('.mw-select-option')).each(function () {
            if(this.$value === val) {
                this.querySelector('input').checked = false;
            }
        });
        this.afterChange()
    };

    this._valueToggle = function(val){
        if (!val) return;
        if (!this._value) {
            this._value = [];
        }
        var exists = this._value.find(function (item) {
            return item.id === val.id;
        });
        if (exists) {
            this._value.splice(this._value.indexOf(exists), 1);
        } else {
            this._value.push(val);
        }
        this.afterChange();
    };

    this.value = function(val){
        if(!val) return this._value;
        val = this._valueGet(val);
        if (!val) return;
        if(this.settings.multiple){
            this._valueToggle(val)
        }
        else {
            this._value = val;
            $('.mw-ui-invisible-field', this.root).val(this.getLabel(val))
            this.close();
        }

        this.afterChange()
    };

    this.setData = function (data) {
        $(scope.holder).empty();
        scope.settings.data = data;
        $.each(scope.settings.data, function(){
            scope.holder.appendChild(scope.rend.option(this))
        });
        return scope.holder;
    };

    this.addData = function (data) {
        $.each(data, function(){
            scope.settings.data.push(this);
            scope.holder.appendChild(scope.rend.option(this));
        });
        return scope.holder;
    };

    this.build = function () {
        this.rend.root();
        this.root.appendChild(this.rend.value());
        this.root.appendChild(this.rend.options());
        if (this._rootInputMode) {
            this.element.type = 'hidden';
            this.$element.before(this.root);
        } else {
            this.$element.html(this.root);
        }
        this.setPlaceholder();
        mw.Select._register.push(this);
    };

    this.init = function () {
        this.build();
        this.element._mwSelect = this;
    };



    this.init();


};

mw.Select._register = [];


$(document).ready(function () {
    $(document).on('mousedown touchstart', function (e) {
        if(!mw.tools.firstParentOrCurrentWithClass(e.target, 'mw-select')){
            mw.Select._register.forEach(function (item) {
                item.close();
            });
        }
    });
});


mw.select = function(options) {
    return new mw.Select(options);
};

})();

(() => {
/*!***********************************!*\
  !*** ../tools/widgets/spinner.js ***!
  \***********************************/
mw.Spinner = function(options){
    if(!options || !options.element){
        return;
    }
    this.$element = $(options.element);
    if(!this.$element.length) return;
    this.element = this.$element[0];
    if(this.element._mwSpinner){
        return this.element._mwSpinner;
    }
    this.element._mwSpinner = this;
    this.options = options;

    this.options.size = this.options.size || 20;
    this.options.color = this.options.color || '#4592ff';
    this.options.insertMode = this.options.insertMode || 'append';

    this.color = function(val){
        if(!val) {
            return this.options.color;
        }
        this.options.color = val;
        this.$spinner.find('circle').css({
            stroke: this.options.color
        });
    };

    this.size = function(val){
        if(!val) {
            return this.options.size;
        }
        this.options.size = parseFloat(val);
        this.$spinner.css({
            width: this.options.size,
            height: this.options.size
        });
    };

    this.create = function(){
        this.$spinner = $('<div class="mw-spinner mw-spinner-mode-' + this.options.insertMode + '" style="display: none;"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg></div>');
        this.size(this.options.size);
        this.color(this.options.color);
        this.$element[this.options.insertMode](this.$spinner);
        this.show();
        return this;
    };

    this.show = function(){
        this.$spinner.show();
        this.$element.addClass('has-mw-spinner');
        if(this.options.decorate) {
            this.$element.addClass('mw-spinner-decorate');
        }
        return this;
    };

    this.hide = function(){
        this.$spinner.hide();
        this.$element.removeClass('has-mw-spinner');
        if(this.options.decorate) {
            this.$element.removeClass('mw-spinner-decorate');
        }
        return this;
    };

    this.remove = function(){
        this.hide();
        this.$spinner.remove();
        delete this.element._mwSpinner;
    };

    this.create().show();

};

mw.spinner = function(options){
    return new mw.Spinner(options);
};

})();

(() => {
/*!***********************************!*\
  !*** ../tools/widgets/storage.js ***!
  \***********************************/
mw.storage = {
    init: function () {
        if (window.location.href.indexOf('data:') === 0 || !('localStorage' in mww) || /* IE Security configurations */ typeof mww['localStorage'] === 'undefined') return false;
        var lsmw = localStorage.getItem("mw");
        if (typeof lsmw === 'undefined' || lsmw === null) {
            lsmw = localStorage.setItem("mw", "{}");
        }
        this.change("INIT");
        return lsmw;
    },
    set: function (key, val) {
        if (!('localStorage' in mww)) return false;
        var curr = JSON.parse(localStorage.getItem("mw"));
        curr[key] = val;
        var a = localStorage.setItem("mw", JSON.stringify(curr));
        mw.storage.change("CALL", key, val);
        return a;
    },
    get: function (key) {
        if (!('localStorage' in mww)) return false;
        var curr = JSON.parse(localStorage.getItem("mw"));
        return curr[key];
    },
    _keys: {},
    change: function (key, callback, other) {
        if (!('localStorage' in mww)) return false;
        if (key === 'INIT' && 'addEventListener' in document) {
            addEventListener('storage', function (e) {
                if (e.key === 'mw') {
                    var _new = JSON.parse(e.newValue || {});
                    var _old = JSON.parse(e.oldValue || {});
                    var diff = mw.tools.getDiff(_new, _old);
                    for (var t in diff) {
                        if (t in mw.storage._keys) {
                            var i = 0, l = mw.storage._keys[t].length;
                            for (; i < l; i++) {
                                mw.storage._keys[t][i].call(diff[t]);
                            }
                        }
                    }
                }
            }, false);
        }
        else if (key === 'CALL') {
            if (!document.isHidden() && typeof mw.storage._keys[callback] !== 'undefined') {
                var i = 0, l = mw.storage._keys[callback].length;
                for (; i < l; i++) {
                    mw.storage._keys[callback][i].call(other);
                }
            }
        }
        else {
            if (key in mw.storage._keys) {
                mw.storage._keys[key].push(callback);
            }
            else {
                mw.storage._keys[key] = [callback];
            }
        }
    }
};
mw.storage.init();

})();

(() => {
/*!***************************************!*\
  !*** ../tools/widgets/uiaccordion.js ***!
  \***************************************/
mw.uiAccordion = function (options) {
    if (!options) return;
    options.element = options.element || '.mw-accordion';

    var scope = this;



    this.getContents = function () {
        this.contents = this.root.children(this.options.contentSelector);
        if (!this.contents.length) {
            this.contents = mw.$();
            this.root.children(this.options.itemSelector).each(function () {
                var title = mw.$(this).children(scope.options.contentSelector)[0];
                if (title) {
                    scope.contents.push(title)
                }
            });
        }
    }
    this.getTitles = function () {
        this.titles = this.root.children(this.options.titleSelector);
        if (!this.titles.length) {
            this.titles = mw.$();
            this.root.children(this.options.itemSelector).each(function () {
                var title = mw.$(this).children(scope.options.titleSelector)[0];
                if (title) {
                    scope.titles.push(title)
                }
            });
        }
    };

    this.prepare = function (options) {
        var defaults = {
            multiple: false,
            itemSelector: ".mw-accordion-item,mw-accordion-item",
            titleSelector: ".mw-accordion-title,mw-accordion-title",
            contentSelector: ".mw-accordion-content,mw-accordion-content",
            openFirst: true,
            toggle: true
        };
        this.options = $.extend({}, defaults, options);

        this.root = mw.$(this.options.element).not('.mw-accordion-ready').eq(0);
        if (!this.root.length) return;
        this.root.addClass('mw-accordion-ready');
        this.root[0].uiAccordion = this;
        this.getTitles();
        this.getContents();

    };

    this.getItem = function (q) {
        var item;
        if (typeof q === 'number') {
            item = this.contents.eq(q)
        }
        else {
            item = mw.$(q);
        }
        return item;
    };

    this.set = function (index) {
        var item = this.getItem(index);
        if (!this.options.multiple) {
            this.contents.not(item)
                .slideUp()
                .removeClass('active')
                .prev()
                .removeClass('active')
                .parents('.mw-accordion-item').eq(0)
                .removeClass('active');
        }
        item.stop()
            .slideDown()
            .addClass('active')
            .prev()
            .addClass('active')
            .parents('.mw-accordion-item').eq(0)
            .addClass('active');
        mw.$(this).trigger('accordionSet', [item]);
    };

    this.unset = function (index) {
        if (typeof index === 'undefined') return;
        var item = this.getItem(index);
        item.stop()
            .slideUp()
            .removeClass('active')
            .prev()
            .removeClass('active')
            .parents('.mw-accordion-item').eq(0)
            .removeClass('active');
        ;
        mw.$(this).trigger('accordionUnset', [item]);
    }

    this.toggle = function (index) {
        var item = this.getItem(index);
        if (item.hasClass('active')) {
            if (this.options.toggle) {
                this.unset(item)
            }
        }
        else {
            this.set(item)
        }
    }

    this.init = function (options) {
        this.prepare(options);
        if(typeof(this.contents) !== 'undefined'){
            this.contents.hide()
        }

        if (this.options.openFirst) {
            if(typeof(this.contents) !== 'undefined'){
                this.contents.eq(0).show().addClass('active')
            }
            if(typeof(this.titles) !== 'undefined'){
                this.titles.eq(0).addClass('active').parent('.mw-accordion-item').addClass('active');
            }
        }
        if(typeof(this.titles) !== 'undefined') {
            this.titles.on('click', function () {
                scope.toggle(scope.titles.index(this));
            });
        }
    }

    this.init(options);

};


mw.tabAccordion = function (options, accordion) {
    if (!options) return;
    var scope = this;
    this.options = options;

    this.options.breakPoint = this.options.breakPoint || 800;
    this.options.activeClass = this.options.activeClass || 'active-info';


    this.buildAccordion = function () {
        this.accordion = accordion || new mw.uiAccordion(this.options);
    }

    this.breakPoint = function () {
        if (matchMedia("(max-width: " + this.options.breakPoint + "px)").matches) {
            mw.$(this.nav).hide();
            mw.$(this.accordion.titles).show();
        }
        else {
            mw.$(this.nav).show();
            mw.$(this.accordion.titles).hide();
        }
    }

    this.createTabButton = function (content, index) {
        this.buttons = this.buttons || mw.$();
        var btn = document.createElement('span');
        this.buttons.push(btn)
        var size = (this.options.tabsSize ? ' mw-ui-btn-' + this.options.tabsSize : '');
        var color = (this.options.tabsColor ? ' mw-ui-btn-' + this.options.tabsColor : '');
        var active = (index === 0 ? (' ' + this.options.activeClass) : '');
        btn.className = 'mw-ui-btn' + size + color + active;
        btn.innerHTML = content;
        btn.onclick = function () {
            scope.buttons.removeClass(scope.options.activeClass).eq(index).addClass(scope.options.activeClass);
            scope.accordion.set(index);
        }
        return btn;
    }

    this.createTabs = function () {
        this.nav = document.createElement('div');
        this.nav.className = 'mw-ui-btn-nav mw-ui-btn-nav-tabs';
        mw.$(this.accordion.titles)
            .each(function (i) {
                scope.nav.appendChild(scope.createTabButton($(this).html(), i))
            })
            .hide();
        mw.$(this.accordion.root).before(this.nav)
    }

    this.init = function () {
        this.buildAccordion();
        this.createTabs();
        this.breakPoint();
        mw.$(window).on('load resize orientationchange', function () {
            scope.breakPoint();
        });
    };

    this.init();
};

})();

(() => {
/*!**********************************!*\
  !*** ../widgets/autocomplete.js ***!
  \**********************************/
mw.autoComplete = function(options){
    var scope = this;
    this.prepare = function(options){
        options = options || {};
        if(!options.data && !options.ajaxConfig) return;
        var defaults = {
            size:'normal',
            multiple:false,
            map: { title:'title', value:'id' },
            titleDecorator: function (title, data) {
                return title;
            }
        };
        this.options = $.extend({}, defaults, options);
        this.options.element = mw.$(this.options.element)[0];
        if(!this.options.element){
            return;
        }
        this.element = this.options.element;
        this.data = this.options.data;
        this.searchTime = null;
        this.searchTimeout = this.options.data ? 0 : 500;
        this.results = [];
        this.map = this.options.map;
        this.selected = this.options.selected || [];
    };

    this.createValueHolder = function(){
        this.valueHolder = document.createElement('div');
        this.valueHolder.className = 'mw-autocomplete-value';
        return this.valueHolder;
    };
    this.createListHolder = function(){
        this.listHolder = document.createElement('ul');
        this.listHolder.className = 'mw-ui-box mw-ui-navigation mw-autocomplete-list';
        this.listHolder.style.display = 'none';
        return this.listHolder;
    };

    this.createWrapper = function(){
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'mw-ui-field w100 mw-autocomplete mw-autocomplete-multiple-' + this.options.multiple;
        return this.wrapper;
    };

    this.createField = function(){
        this.inputField = document.createElement('input');
        this.inputField.className = 'mw-ui-invisible-field mw-autocomplete-field mw-ui-field-' + this.options.size;
        if(this.options.placeholder){
            this.inputField.placeholder = this.options.placeholder;
        }
        mw.$(this.inputField).on('input focus', function(e){
            var val = e.type === 'focus' ? '' : this.value;
            scope.search(val);
        });
        return this.inputField;
    };

    this.buildUI = function(){
        this.createWrapper();
        this.wrapper.appendChild(this.createValueHolder());
        this.wrapper.appendChild(this.createField());
        this.wrapper.appendChild(this.createListHolder());
        this.element.appendChild(this.wrapper);
    };

    this.createListItem = function(data){
        var li = document.createElement('li');
        li.value = this.dataValue(data);
        var img = this.dataImage(data);

        mw.$(li)
        .append( '<a href="javascript:;">'+this.dataTitle(data)+'</a>' )
        .on('click', function(){
            scope.select(data);
        });
        if(img){
            mw.$('a',li).prepend(img);
        }
        return li;
    };

    this.uniqueValue = function(){
        var uniqueIds = [], final = [];
        this.selected.forEach(function(item){
            var val = scope.dataValue(item);
            if(uniqueIds.indexOf(val) === -1){
                uniqueIds.push(val);
                final.push(item);
            }
        });
        this.selected = final;
    };

    this.select = function(item){
        if(this.options.multiple){
            this.selected.push(item);
        }
        else{
            this.selected = [item];
        }
        this.rendSelected();
        if(!this.options.multiple){
            this.listHolder.style.display = 'none';
        }
        mw.$(this).trigger('change', [this.selected]);
    };

    this.rendSingle = function(){
        var item = this.selected[0];
        this.inputField.value = item ? item[this.map.title] : '';
        this.valueHolder.innerHTML = '';
        var img = this.dataImage(item);
        if(img){
            this.valueHolder.appendChild(img);
        }

    };

    this.rendSelected = function(){
        if(this.options.multiple){
            this.uniqueValue();
            this.chips.setData(this.selected);
        }
        else{
            this.rendSingle();
        }
    };

    this.rendResults = function(){
        mw.$(this.listHolder).empty().show();
        $.each(this.results, function(){
            scope.listHolder.appendChild(scope.createListItem(this));
        });
    };

    this.dataValue = function(data){
        if(!data) return;
        if(typeof data === 'string'){
            return data;
        }
        else{
            return data[this.map.value];
        }
    };
    this.dataImage = function(data){
        if(!data) return;
        if(data.picture){
            data.image = data.picture;
        }
        if(data.image){
            var img = document.createElement('span');
            img.className = 'mw-autocomplete-img';
            img.style.backgroundImage = 'url(' + data.image + ')';
            return img;
        }
    };
    this.dataTitle = function(data){
        if (!data) return;
        var title;
        if (typeof data === 'string') {
            title = data;
        }
        else {
            title = data[this.map.title];
        }

        return this.options.titleDecorator(title, data);
    };

    this.searchRemote = function(val){
        var config = mw.tools.cloneObject(this.options.ajaxConfig);

        if(config.data){
            if(typeof config.data === 'string'){
                config.data = config.data.replace('${val}',val);
            }
            else{
               $.each(config.data, function(key,value){

                    if(value.indexOf && value.indexOf('${val}') !==-1 ){
                        config.data[key] = value.replace('${val}', val);
                    }
               });
            }
        }
        if(config.url){
            config.url = config.url.replace('${val}',val);
        }
        var xhr = $.ajax(config);
        xhr.done(function(data){
            if(data.data){
                scope.data = data.data;
            }
            else{
               scope.data = data;
            }
            scope.results = scope.data;
            scope.rendResults();
        })
        .always(function(){
            scope.searching = false;
        });
    };

    this.searchLocal = function(val){

        this.results = [];
        var toSearch;
        $.each(this.data, function(){
           if(typeof this === 'string'){
                toSearch = this.toLowerCase();
           }
           else{
               toSearch = this[scope.map.title].toLowerCase();
           }
           if(toSearch.indexOf(val) !== -1){
            scope.results.push(this);
           }
        });
       this.rendResults();
       scope.searching = false;
    };

    this.search = function(val){
        if(scope.searching) return;
        val = val || '';
        val = val.trim().toLowerCase();

        if(this.options.data){
            this.searchLocal(val);
        }
        else{
            clearTimeout(this.searchTime);
            setTimeout(function(){
                scope.searching = true;
                scope.searchRemote(val);
            }, this.searchTimeout);
        }
    };

    this.init = function(){
        this.prepare(options);
        this.buildUI();
        if(this.options.multiple){
            this.chips = new mw.chips({
                element:this.valueHolder,
                data:[]
            });
        }
        this.rendSelected();
        this.handleEvents();
    };

    this.handleEvents = function(){
        mw.$(document.body).on('click', function(e){
            if(!mw.tools.hasParentsWithClass(e.target, 'mw-autocomplete')){
                scope.listHolder.style.display = 'none';
            }
        });
    };


    this.init();

};

})();

(() => {
/*!********************************!*\
  !*** ../widgets/block-edit.js ***!
  \********************************/
mw.blockEdit = function (options) {
    options = options || {};
    var defaults = {
        element: document.body,
        mode: 'wrap' // wrap | in
    };

    var scope = this;

    var settings = $.extend({}, defaults, options);

    settings.$element = mw.$(settings.element);
    settings.element = settings.$element[0];
    this.settings = settings;
    if(!settings.element) {
        return;
    }

    this.set = function(mode){
        if(mode === 'edit'){
            this.$slider.stop().animate({
                left: '-100%',
                height: this.$editSlide.outerHeight()
            }, function(){
                scope.$holder.addClass('mw-block-edit-editing');
                scope.$slider.height('auto');
            });
        } else {
            this.$slider.stop().animate({
                left: '0',
                height: this.$mainSlide.outerHeight()
            }, function(){
                scope.unEditByElement();
                scope.$holder.removeClass('mw-block-edit-editing');
                scope.$slider.height('auto');
            });
        }
    };

    this.close = function(content){
        this.set();
        $(this).trigger('CloseEdit');
    };
    this.edit = function(content){
        if(content){
            this.$editSlide.empty().append(content);
        }
        this.set('edit');
        $(this).trigger('Edit');
    };

    this._editByElement = null;
    this._editByElementTemp = null;

    this.unEditByElement = function(){
        if(this._editByElement){
            $(this._editByElementTemp).replaceWith(this._editByElement);
            $(this._editByElement).hide()
        }
        this._editByElement = null;
        this._editByElementTemp = null;
    };

    this.editByElement = function(el){
        if(!el){
            return;
        }
        this.unEditByElement();
        this._editByElementTemp = document.createElement('mw-temp');
        this._editByElement = el;
        $(el).before(this._editByElementTemp);
        this.editSlide.appendChild(el);
        $(el).show()
    };
    this.moduleEdit = function(module, params){
        mw.tools.loading(this.holder, 90);
        mw.load_module(module, this.editSlide, function(){
            scope.edit();
            mw.tools.loading(scope.holder, false);
        }, params);
    };

    this.build = function(){
        this.holder = document.createElement('div');
        this.$holder = $(this.holder);
        this.holder.className = 'mw-block-edit-holder';
        this.holder._blockEdit = this;
        this.slider = document.createElement('div');
        this.$slider = $(this.slider);
        this.slider.className = 'mw-block-edit-slider';
        this.mainSlide = document.createElement('div');
        this.$mainSlide = $(this.mainSlide);
        this.editSlide = document.createElement('div');
        this.$editSlide = $(this.editSlide);
        this.mainSlide.className = 'mw-block-edit-main-slide';
        this.editSlide.className = 'mw-block-edit-edit-slide';

        this.slider.appendChild(this.mainSlide);
        this.slider.appendChild(this.editSlide);
        this.holder.appendChild(this.slider);
        //this.settings.$element.before(this.holder);
        // this.mainSlide.appendChild(settings.element);

    };

    this.initMode = function(){
        if(this.settings.mode === 'wrap') {
            this.settings.$element.after(this.holder);
            this.$mainSlide.append(this.settings.$element);
        } else if(this.settings.mode === 'in') {
            this.settings.$element.wrapInner(this.holder);
        }
    };

    this.init = function () {
        this.build();
        this.initMode();
    };

    this.init();

};

mw.blockEdit.get = function(target){
    target = target || '.mw-block-edit-holder';
    target = mw.$(target);
    if(!target[0]) return;
    if(target.hasClass('mw-block-edit-holder')){
        return target[0]._blockEdit;
    } else {
        var node = mw.tools.firstParentWithClass(target[0], 'mw-block-edit-holder') || target[0].querySelector('.mw-block-edit-holder');
        if(node){
            return node._blockEdit;
        }
    }
};

$.fn.mwBlockEdit = function (options) {
    options = options || {};
    return this.each(function(){
        this.mwBlockEdit =  new mw.blockEdit($.extend({}, options, {element: this }));
    });
};

mw.registerComponent('block-edit', function(el){
    var options = mw.components._options(el);
    mw.$(el).mwBlockEdit(options);
});
mw.registerComponent('block-edit-closeButton', function(el){
    mw.$(el).on('click', function(){
        mw.blockEdit.get(this).close();
    });
});
mw.registerComponent('block-edit-editButton', function(el){
    mw.$(el).on('click', function(){
        var options = mw.components._options(this);
        if(options.module){
            mw.blockEdit.get(options.for || this).moduleEdit(options.module);
            return;
        } else if(options.element){
            var el = mw.$(options.element)[0];
            if(el){
                mw.blockEdit.get(options.for || this).editByElement(el);
            }
        }
        mw.blockEdit.get(this).edit();
    });
});

})();

(() => {
/*!*********************************!*\
  !*** ../widgets/control_box.js ***!
  \*********************************/
mw.controlBox = function(options){
    var scope = this;
    this.options = options;
    this.defaults = {
        position:'bottom',
        content:'',
        skin:'default',
        id:this.options.id || 'mw-control-box-'+mw.random(),
        closeButton: true
    };
    this.id = this.options.id;
    this.settings = $.extend({}, this.defaults, this.options);
    this.active = false;

    this.build = function(){
        this.box = document.createElement('div');
        this.box.className = 'mw-control-box mw-control-box-' + this.settings.position + ' mw-control-box-' + this.settings.skin;
        this.box.id = this.id;
        this.boxContent = document.createElement('div');
        this.boxContent.className = 'mw-control-boxcontent';
        this.box.appendChild(this.boxContent);
        this.createCloseButton();
        document.body.appendChild(this.box);
    };

    this.createCloseButton = function () {
        if(!this.options.closeButton) return;
        this.closeButton = document.createElement('span');
        this.closeButton.className = 'mw-control-boxclose';
        this.box.appendChild(this.closeButton);
        this.closeButton.onclick = function(){
            scope.hide();
        };
    };

    this.setContentByUrl = function(){
        var cont = this.settings.content.trim();
        return $.get(cont, function(data){
            scope.boxContent.innerHTML = data;
            scope.settings.content = data;
        });
    };
    this.setContent = function(c){
        var cont = c||this.settings.content.trim();
        this.settings.content = cont;
        if(cont.indexOf('http://') === 0 || cont.indexOf('https://') === 0){
            return this.setContentByUrl()
        }
        this.boxContent.innerHTML = cont;
    };

    this.show = function(){
        this.active = true;
        mw.$(this.box).addClass('active') ;
        mw.$(this).trigger('ControlBoxShow')
    };

    this.init = function(){
        this.build();
        this.setContent();
    };
    this.hide = function(){
        this.active = false;
        mw.$(this.box).removeClass('active');
        mw.$(this).trigger('ControlBoxHide');
    };


    this.toggle = function(){
        this[this.active?'hide':'show']();
    };
    this.init();
};

})();

(() => {
/*!***********************************!*\
  !*** ../widgets/form-controls.js ***!
  \***********************************/

mw.require('autocomplete.js');


mw.IconClassResolver = function ($for) {
    if (!$for) {
        return '';
    }
    switch ($for) {
        case 'shop': $for = 'mdi mdi-shopping'; break;
        case 'website': $for = 'mdi mdi-earth'; break;
        case 'module': $for = 'mdi mdi-view-grid-plus'; break;
        case 'marketplace': $for = 'mdi mdi-fruit-cherries'; break;
        case 'users': $for = 'mdi mdi-account-multiple'; break;
        case 'post': $for = 'mdi mdi-text'; break;
        case 'page': $for = 'mdi mdi-shopping'; break;
        case 'static': $for = 'mdi mdi-shopping'; break;
        case 'category': $for = 'mdi mdi-folder'; break;
        case 'product': $for = 'mdi mdi-shopping'; break;

        default: $for = '';
    }
    return $for;
};

mw.controlFields = {
    __id: new Date().getTime(),
    _id: function () {
        this.__id++;
        return 'le-' + this.__id;
    },
    _label: function (conf) {
        var id = conf.id || this._id();
        var label = document.createElement('label');
        label.className = conf.className || 'mw-ui-label';
        label.innerHTML = conf.label || conf.content || '';
        label.htmlFor = id;
        return label;
    },
    _button: function (conf){
        var id = conf.id || this._id();
        var button = document.createElement('button');
        button.type = conf.type || 'button';
        button.className = 'mw-ui-btn btn-' + conf.size + ' btn-' + conf.color;
        button.innerHTML = (conf.label || conf.content);
        return button;
    },
    _wrap: function () {
        var el =  document.createElement('div');
        el.className = 'mw-ui-field-holder';
        [].forEach.call(arguments, function (content) {
            if (typeof content === 'string') {
                el.innerHTML += content;
            } else {
                el.append(content);
            }
        });
        return el;
        // return '<div class="form-group">' + content + '</div>';
    },
    _description: function (conf) {
        return conf.description ? ('<small class="text-muted d-block mb-2">' + conf.description + '</small>') : '';
    },
    field: function (conf) {
        conf = conf || {};
        var placeholder = conf.placeholder ? ('placeholder="' + conf.placeholder + '"') : '';
        var id = (conf.id || this._id());
        id =  (' id="' + id + '" ');
        var name = conf.name ? ('name="' + conf.name + '"') : '';
        conf.type = conf.type || 'text';
        var required = conf.required ? ('required') : '';

        return this._wrap(
            this._label(conf),
            this._description(conf),
            '<input type="'+conf.type+'" '+placeholder + '  ' + id + ' ' + name + ' ' + required + ' class="mw-ui-field w100">'
        );
    },
    checkbox: function (conf) {
        conf = conf || {};
        conf.className = conf.className || 'custom-control-label';
        var id = (conf.id || this._id());
        conf.id = id;
        id =  (' id="' + id + '" ');
        var name = conf.name ? ('name="' + conf.name + '"') : '';
        var required = conf.required ? ('required') : '';
        return  this._wrap(
            '<label class="mw-ui-check">' +
            '<input type="checkbox" ' + id + ' ' + name + ' ' + required + '>' +
            '<span></span><span>' + (conf.label || conf.content || '') + '</span>' +
            '</label>');
    },
    radio: function (conf) {
        conf = conf || {};
        var id = (conf.id || this._id());
        id =  (' id="' + id + '" ');
        var value =  (' value="' + conf.value + '" ');
        var name = conf.name ? ('name="' + conf.name + '"') : '';
        var required = conf.required ? ('required') : '';
        return  this._wrap(
            '<label class="mw-ui-check">' +
            '<input type="radio" ' + id + ' ' + name + ' ' + required + ' ' + value + '>' +
                '<span></span><span>' + (conf.label || conf.content || '') + '</span>' +
            '</label>');
    },
    select: function (conf) {
        conf = conf || {};
        var id = (conf.id || this._id());
        id =  (' id="' + id + '" ');
        var name = conf.name ? ('name="' + conf.name + '"') : '';
        var required = conf.required ? ('required') : '';
        var multiple = conf.multiple ? ('multiple') : '';

        var options = (conf.options || []).map(function (item){
            return '<option value="'+ item.value +'">'+(item.title||item.name||item.label||item.value)+'</option>';
        }).join('');

        return  this._wrap(
            this._label(conf) +
            '<select class="selectpicker" ' + multiple + '  ' + id + ' ' + name + ' ' + required + '>' +
            options +
            '</select>' );
    }
};

mw.emitter = {
    _events: {},
    _onNative: function (node, type, callback) {
        type.trim().split(' ').forEach(function (ev) {
            node.addEventListener(ev, callback);
        });
    },
    on: function (event, callback, c) {
        if(!event) return;
        if(Array.isArray(event)) {
            for(var i = 0; i < event.length; i++) {
                this.on(event[i], callback, c);
            }
            return;
        }
        if(event.nodeName) {
            return this._onNative(event, callback, c);
        }
        if (!this._events[event]){
            this._events[event] = [];
        }
        this._events[event].push(callback);
    },
    dispatch: function(event, data) {
        if (this._events[event]) {
            this._events[event].forEach(function(handler) {
                handler(data);
            });
        }
    }
};

(function(){
    var UIFormControllers = {
        _title: function (conf, root) {
            var title = mw.element({
                tag: 'h5',
                props: {
                    className: 'mw-ui-form-controller-title',
                    innerHTML: '<strong>' + conf.title + '</strong>'
                }
            });
            mw.element(root).append(title);
        },
        footer: function () {
            var data = {};
            data.ok =  mw.controlFields._button({content: mw.lang('OK'), color: 'primary'});
            data.cancel =  mw.controlFields._button({content: mw.lang('Cancel')});
            data.root = mw.controlFields._wrap(data.cancel, data.ok);
            data.root.className = 'mw-ui-form-controllers-footer';
            return data;
        },
        title: function (options) {
            var scope = this;
            var defaults = {
                text: {
                    label: mw.lang('Link text'),
                    description: mw.lang('Selected text for the link.'),
                },
                icon: 'mdi mdi-view-compact-outline',
                // icon: 'mdi mdi-format-page-break',
                title: 'Page title'
            };
            options =  mw.object.extend(true, {}, defaults, (options || {}));
            this.settings = options;
            if (options.text === true) options.text = defaults.text;
            if (options.link === true) options.link = defaults.link;
            if (options.target === true) options.target = defaults.target;

            var root = document.createElement('div');
            root.className = 'mw-ui-form-controller-root';
            var _linkText = '', _linkUrl = '', _target = '';

            if (options.text) {
                _linkText = mw.controlFields.field({
                    label: options.text.label,
                    description: options.text.description,
                    name: 'text'
                });
            }

            UIFormControllers._title(this.settings, root)


            var count = 0;
            var html = [];
            this.url = '';
            var available_elements = document.createElement('div');
            available_elements.className = 'mw-ui-box mw-ui-box-content';
            var rname = mw.controlFields._id();
            mw.top().$("h1,h12,h3,h4,h5,h6", mw.top().win.document.body).each(function () {
                if(!!this.id || mw.tools.isEditable(this)){
                    if(!this.id) {
                        this.id = mw.id('mw-title-element-');
                    }
                    count++;
                    html.push({id: this.id, text: this.textContent});
                    var li = mw.controlFields.radio({
                        label:  '<strong>' + this.nodeName + '</strong> - ' + this.textContent,
                        name: rname,
                        id: mw.controlFields._id(),
                        value: '#' + this.id
                    });
                    mw.element(available_elements).append(li);
                    li.querySelector('input').oninput = function () {
                        scope.url = this.value;
                        scope.valid();
                    };
                }

            });

            var holder = document.createElement('div');
            holder.append(_linkText);
            holder.append(available_elements);


            var textField = holder.querySelector('[name="text"]');

            this.valid = function () {
                var res = this.isValid();
                footer.ok.disabled = !res;
                return res;
            };

            this.isValid = function () {
                if(textField && !textField.value) {
                    return false;
                }
                if(!this.url) {
                    return false;
                }

                return true;
            };

            var footer = UIFormControllers.footer();

            this.setValue = function (val) {
                val = val || {};
                if(textField) textField.value = val.text || '';
            };

            this.getValue = function () {
                var val = {};
                if(textField) val.text = textField.value;
                val.url = this.url
                return val;
            };

            this._onChange = [];
            this.onChange = function (c) {
                this._onChange.push(c);
            };

            this._confirm = [];
            this.onConfirm = function (c) {
                this._confirm.push(c);
            };

            this._cancel = [];
            this.onCancel = function (c) {
                this._cancel.push(c);
            };


            mw.emitter.on([textField], 'input', function (e){
                if(scope.valid()) {
                    scope._onChange.forEach(function (f){
                        f(scope.getValue());
                    });
                }
            });

            mw.emitter.on(footer.ok, 'click', function (e){
                scope._confirm.forEach(function (f){
                    f(scope.getValue());
                });
            });

            mw.emitter.on(footer.cancel, 'click', function (e){
                scope._cancel.forEach(function (f){
                    f();
                });
            });

            root.append(holder);

            root.append(footer.root);

            this.valid();

            this.root = root;
        },
        layout: function (options) {
            var scope = this;
            var defaults = {
                text: {
                    label: mw.lang('Link text'),
                    description: mw.lang('Selected text for the link.'),
                },
                icon: 'mdi mdi-view-compact-outline',
                // icon: 'mdi mdi-format-page-break',
                title: 'Page block'
            };
            options =  mw.object.extend(true, {}, defaults, (options || {}));
             this.settings = options;
            if (options.text === true) options.text = defaults.text;
            if (options.link === true) options.link = defaults.link;
            if (options.target === true) options.target = defaults.target;

            var root = document.createElement('div');
            root.className = 'mw-ui-form-controller-root';
            var _linkText = '', _linkUrl = '', _target = '';

            if (options.text) {
                _linkText = mw.controlFields.field({
                    label: options.text.label,
                    description: options.text.description,
                    name: 'text'
                });
            }
            UIFormControllers._title(this.settings, root)

            var layoutsData = [];
            var layouts = mw.top().$('.module[data-type="layouts"]');
            layouts.each(function () {
                layoutsData.push({
                    name: this.getAttribute('template').split('.')[0],
                    element: this,
                    id: this.id
                });
            });
            var list = $('<div />');
            this.link = '';
            var radioName = mw.id();
            $.each(layoutsData, function(){
                var li = mw.controlFields.radio({
                    label: this.name,
                    name: radioName,
                    id: mw.controlFields._id(),
                    value: this.id
                });
                var el = this.element;
                $(li).find('input').on('click', function(){
                    mw.top().tools.scrollTo(el);
                    scope.link = mw.top().win.location.href.split('#')[0] + '#mw@' + el.id;
                    console.log(scope.link)
                    scope.valid();
                });
                list.append(li);
            });
            if(layoutsData.length > 0){
                $('.page-layout-btn').show();
            }

            var holder = document.createElement('div');
            holder.append(_linkText);
            holder.append(list[0]);


            var textField = holder.querySelector('[name="text"]');

            this.valid = function () {
                var res = this.isValid();
                footer.ok.disabled = !res;
                return res;
            };

            this.isValid = function () {
                if(textField && !textField.value) {
                    return false;
                } else if(!this.link) {
                    return false;
                }

                return true;
            };

            var footer = UIFormControllers.footer();

            this.setValue = function (val) {
                val = val || {};
                if(textField) textField.value = val.text || '';
              };

            this.getValue = function () {
                var val = {};
                if(textField) val.text = textField.value;
                  return val;
            };

            this._onChange = [];
            this.onChange = function (c) {
                this._onChange.push(c);
            };

            this._confirm = [];
            this.onConfirm = function (c) {
                this._confirm.push(c);
            };

            this._cancel = [];
            this.onCancel = function (c) {
                this._cancel.push(c);
            };


            mw.emitter.on([textField], 'input', function (e){
                if(scope.valid()) {
                    scope._onChange.forEach(function (f){
                        f(scope.getValue());
                    });
                }
            });

            mw.emitter.on(footer.ok, 'click', function (e){
                 scope._confirm.forEach(function (f){
                    f(scope.getValue());
                });
            });

            mw.emitter.on(footer.cancel, 'click', function (e){
                scope._cancel.forEach(function (f){
                    f();
                });
            });

            root.append(holder);

            root.append(footer.root);

            this.valid();

            this.root = root;
        },
        email: function (options) {
            var scope = this;
            var defaults = {
                text: {
                    label: mw.lang('Link text'),
                    description: mw.lang('Selected text for the link.'),
                },
                link: {
                    label: mw.lang('Email'),
                    description: mw.lang('Type email address in the field'),
                    placeholder: "hello@example.com",
                },
                target: {
                    label: mw.lang('Open the link in a new window')
                },
                icon: 'mdi mdi-email-outline',
                title: 'Email'
            };
            options =  mw.object.extend(true, {}, defaults, (options || {}));
            this.settings = options;
            if (options.text === true) options.text = defaults.text;
            if (options.link === true) options.link = defaults.link;
            if (options.target === true) options.target = defaults.target;

            var root = document.createElement('div');
            root.className = 'mw-ui-form-controller-root';
            var _linkText = '', _linkUrl = '', _target = '';
            UIFormControllers._title(this.settings, root)
            if (options.text) {
                _linkText = mw.controlFields.field({
                    label: options.text.label,
                    description: options.text.description,
                    name: 'text'
                });
            }
            if (options.link) {
                _linkUrl = mw.controlFields.field({
                    label: options.link.label,
                    description: options.link.description,
                    placeholder: options.link.placeholder,
                    name: 'url'
                });
            }

            if (options.target) {
                _target = mw.controlFields.checkbox({
                    label: options.target.label,
                    name: 'target'
                });
            }


            var holder = document.createElement('div');
            holder.append(_linkText);
            holder.append(_linkUrl);
            holder.append(_target);


            var textField = holder.querySelector('[name="text"]');
            var urlField = holder.querySelector('[name="url"]');
            var targetField = holder.querySelector('[name="target"]');

            this.valid = function () {
                var res = this.isValid();
                footer.ok.disabled = !res;
                return res;
            };

            this.isValid = function () {
                if(textField && !textField.value) {
                    return false;
                }
                if(urlField && !urlField.value) {
                    return false;
                }

                return urlField.validity;
            };

            var footer = UIFormControllers.footer();

            this.setValue = function (val) {
                val = val || {};
                if(textField) textField.value = val.text || '';
                if(urlField) urlField.value = (val.url || '');
                if(targetField)  targetField.checked = val.target;
            };

            this.getValue = function () {
                var val = {};
                if(textField) val.text = textField.value;
                if(urlField) val.url = 'mailto:' + urlField.value;
                if(targetField) val.target = targetField.checked;
                return val;
            };

            this._onChange = [];
            this.onChange = function (c) {
                this._onChange.push(c);
            };

            this._confirm = [];
            this.onConfirm = function (c) {
                this._confirm.push(c);
            };

            this._cancel = [];
            this.onCancel = function (c) {
                this._cancel.push(c);
            };


            mw.emitter.on([textField, urlField, targetField], 'input', function (e){
                if(scope.valid()) {
                    scope._onChange.forEach(function (f){
                        f(scope.getValue());
                    });
                }
            });

            mw.emitter.on(footer.ok, 'click', function (e){
                scope._confirm.forEach(function (f){
                    f(scope.getValue());
                });
            });

            mw.emitter.on(footer.cancel, 'click', function (e){
                scope._cancel.forEach(function (f){
                    f();
                });
            });

            root.append(holder);

            root.append(footer.root);

            this.valid();

            this.root = root;
        },

        post: function (options) {
            var scope = this;
            var defaults = {
                text: {
                    label: mw.lang('Link text'),
                    description: mw.lang('Selected text for the link.'),
                },
                target: {
                    label: mw.lang('Open the link in a new window')
                },
                url: {
                    label: mw.lang('Search for content')
                },
                icon: 'mdi mdi-format-list-bulleted-square',
                title: 'Post/category',
                dataUrl: function () {
                    try {
                        return mw.settings.site_url + "api/get_content_admin";
                    } catch (e) {
                        return null;
                    }
                }
            };
            options =  mw.object.extend(true, {}, defaults, (options || {}));
            this.settings = options;
            if (options.text === true) options.text = defaults.text;
            if (options.target === true) options.target = defaults.target;

            var root = document.createElement('div');
            root.className = 'mw-ui-form-controller-root';
            var _linkText = '', _linkUrl = '', _target = '';
            UIFormControllers._title(this.settings, root);
            var treeEl = document.createElement('div');
            treeEl.className = 'form-group mw-link-editor-posts-search';

            if (options.text) {
                _linkText = mw.controlFields.field({
                    label: options.text.label,
                    description: options.text.description,
                    name: 'text'
                });
            }
            var url =  this.settings.dataUrl;
            url = typeof url === 'function' ? url() : url;

            this.autoComplete = new mw.autoComplete({
                element: treeEl,
                titleDecorator: function (title, data) {
                    var type = data.subtype === 'static' ? 'page' : data.subtype;
                    return '<span class=" tip '+mw.IconClassResolver(data.subtype)+'" data-tip="' + type + '"></span>' + title;
                },
                ajaxConfig: {
                    method: 'post',
                    url: url,
                    data: {
                        limit: '5',
                        keyword: '${val}',
                        order_by: 'updated_at desc',
                        search_in_fields: 'title',
                    }
                }
            });


            var label = mw.controlFields._label({
                content: options.url.label
            });

            setTimeout(function (){
                mw.element(treeEl).before(label);
            }, 10)

            if (options.target) {
                _target = mw.controlFields.checkbox({
                    label: options.target.label,
                    name: 'target'
                });
            }


            var holder = document.createElement('div');
            holder.append(_linkText);
            holder.append(treeEl);
            holder.append(_target);


            var textField = holder.querySelector('[name="text"]');
            var targetField = holder.querySelector('[name="target"]');

            this.valid = function () {
                var res = this.isValid();
                footer.ok.disabled = !res;
                return res;
            };

            this.isValid = function () {
                if(textField && !textField.value) {
                    return false;
                }
                return true;
            };

            var footer = UIFormControllers.footer();

            this.getValue = function () {
                var val = {};
                if(textField) val.text = textField.value;
                var getSelected = this.autoComplete.selected[0];
                val.url = getSelected ? getSelected.url : '';
                val.data = getSelected;
                if(targetField) val.target = targetField.checked;
                return val;
            };

            this.setValue = function (val) {
                val = val || {};
                if(textField) textField.value = val.text || '';
                if(targetField) targetField.checked = !!val.target;
                return val;
            };

            this._onChange = [];
            this.onChange = function (c) {
                this._onChange.push(c);
            };

            this._confirm = [];
            this.onConfirm = function (c) {
                this._confirm.push(c);
            };

            this._cancel = [];
            this.onCancel = function (c) {
                this._cancel.push(c);
            };

            $(this.autoComplete).on("change", function(e){
                if(scope.valid()) {
                    scope._onChange.forEach(function (f){
                        f(scope.getValue());
                    });
                }
            });
            mw.emitter.on([textField, targetField], 'input', function (e){
                if(scope.valid()) {
                    scope._onChange.forEach(function (f){
                        f(scope.getValue());
                    });
                }
            });

            mw.emitter.on(footer.ok, 'click', function (e){
                scope._confirm.forEach(function (f){
                    f(scope.getValue());
                });
            });

            mw.emitter.on(footer.cancel, 'click', function (e){
                scope._cancel.forEach(function (f){
                    f();
                });
            });

            root.append(holder);

            root.append(footer.root);

            this.valid();

            this.root = root;
        },
        page: function (options) {
            var scope = this;
             var defaults = {
                text: {
                    label: mw.lang('Link text'),
                    description: mw.lang('Selected text for the link.'),
                },
                target: {
                    label: mw.lang('Open the link in a new window')
                },
                icon: 'mdi mdi-file-link-outline',
                title: 'My website',
                dataUrl: function () {
                    try {
                        return mw.top().settings.api_url + 'content/get_admin_js_tree_json';
                    } catch (e) {
                        return null;
                    }
                }
            };
            options =  mw.object.extend(true, {}, defaults, (options || {}));
            this.settings = options;
            if (options.text === true) options.text = defaults.text;
            if (options.target === true) options.target = defaults.target;

            var root = document.createElement('div');
            root.className = 'mw-ui-form-controller-root';
            var _linkText = '', _linkUrl = '', _target = '';
            UIFormControllers._title(this.settings, root)
            var treeEl = document.createElement('div');
            treeEl.className = 'form-group';
            if (options.text) {
                _linkText = mw.controlFields.field({
                    label: options.text.label,
                    description: options.text.description,
                    name: 'text'
                });
            }
             var url = typeof this.settings.dataUrl === 'function' ? this.settings.dataUrl() : this.settings.dataUrl;
            mw.require('tree.js')
            $.getJSON(url, function (res){
                scope.tree = new mw.tree({
                    data: res,
                    element: treeEl,
                    sortable: false,
                    selectable: true,
                    singleSelect: true
                });
                scope.tree.on("selectionChange", function(selection){
                    if (textField && selection && selection[0]) {
                        textField.value = selection[0].title;
                    }
                    if(scope.valid()) {
                        scope._onChange.forEach(function (f){
                            f(scope.getValue());
                        });


                    }
                });
            });

            if (options.target) {
                _target = mw.controlFields.checkbox({
                    label: options.target.label,
                    name: 'target'
                });
            }


            var holder = document.createElement('div');
            holder.append(_linkText);
            holder.append(treeEl);
            holder.append(_target);


            var textField = holder.querySelector('[name="text"]');
            var targetField = holder.querySelector('[name="target"]');

            this.valid = function () {
                var res = this.isValid();
                footer.ok.disabled = !res;
                return res;
            };

            this.isValid = function () {
                if(textField && !textField.value) {
                    return false;
                }
                return true;
            };

            var footer = UIFormControllers.footer();

            this.getValue = function () {
                var val = {};
                if(textField) val.text = textField.value;
                var getSelected = this.tree.getSelected()[0];
                val.url = getSelected ? getSelected.url : '';
                val.data = getSelected;
                if(targetField) val.target = targetField.checked;
                return val;
            };

            this.setValue = function (val) {
                val = val || {};
                if(textField) textField.value = val.text || '';
                if(targetField) targetField.checked = val.target;
                return val;
            };

            this._onChange = [];
            this.onChange = function (c) {
                this._onChange.push(c);
            };

            this._confirm = [];
            this.onConfirm = function (c) {
                this._confirm.push(c);
            };

            this._cancel = [];
            this.onCancel = function (c) {
                this._cancel.push(c);
            };

            mw.emitter.on([textField, targetField], 'input', function (e){
                if(scope.valid()) {
                    scope._onChange.forEach(function (f){
                        f(scope.getValue());
                    });
                }
            });

            mw.emitter.on(footer.ok, 'click', function (e){
                scope._confirm.forEach(function (f){
                    f(scope.getValue());
                });
            });

            mw.emitter.on(footer.cancel, 'click', function (e){
                scope._cancel.forEach(function (f){
                    f();
                });
            });

            root.append(holder);

            root.append(footer.root);

            this.valid();

            this.root = root;
        },
        file: function (options) {
            var scope = this;
            var defaults = {
                text: {
                    label: mw.lang('Link text'),
                    description: mw.lang('Selected text for the link.'),
                },

                target: {
                    label: mw.lang('Open the link in a new window')
                },
                icon: 'mdi mdi-paperclip',
                title: 'File',
                dataUrl: function () {
                    try {
                        return mw.settings.api_url + 'content/get_admin_js_tree_json';
                    } catch (e) {
                        return null;
                    }
                }
            };
            options =  mw.object.extend(true, {}, defaults, (options || {}));
             this.settings = options;
            if (options.text === true) options.text = defaults.text;
            if (options.target === true) options.target = defaults.target;

            var root = document.createElement('div');
            root.className = 'mw-ui-form-controller-root';
            var _linkText = '', _linkUrl = '', _target = '';
            UIFormControllers._title(this.settings, root)
            var treeEl = document.createElement('div');
            treeEl.className = 'form-group';
            if (options.text) {
                _linkText = mw.controlFields.field({
                    label: options.text.label,
                    description: options.text.description,
                    name: 'text'
                });
            }
             var url =  this.settings.dataUrl;
            url = typeof url === 'function' ? url() : url;
             scope.filepicker = new mw.filePicker({

                element: treeEl,
                nav: 'tabs',
                label: false
            });
            treeEl.append(mw.controlFields._label({content: 'Select file'}))
            if (options.target) {
                _target = mw.controlFields.checkbox({
                    label: options.target.label,
                    name: 'target'
                });
            }


            var holder = document.createElement('div');
            holder.append(_linkText);
            holder.append(treeEl);
            holder.append(_target);


            var textField = holder.querySelector('[name="text"]');
            var targetField = holder.querySelector('[name="target"]');

            this.valid = function () {
                var res = this.isValid();
                footer.ok.disabled = !res;
                return res;
            };

            this.isValid = function () {
                if(textField && !textField.value) {
                    return false;
                }
                return !!this.filepicker.getValue();
            };

            var footer = UIFormControllers.footer();

            this.getValue = function () {
                var val = {};
                if(textField) val.text = textField.value;
                var url = this.filepicker.getValue();
                val.url = typeof url === 'object' ? (url.src || url.url) : url;
                val.data = (url.src || url.url || null);
                if(targetField) val.target = targetField.checked;
                return val;
            };

            this.setValue = function (val) {
                val = val || {};
                if(textField) textField.value = val.text || '';
                if(targetField) targetField.checked = !!val.target;
                return val;
            };

            this._onChange = [];
            this.onChange = function (c) {
                this._onChange.push(c);
            };

            this._confirm = [];
            this.onConfirm = function (c) {
                this._confirm.push(c);
            };

            this._cancel = [];
            this.onCancel = function (c) {
                this._cancel.push(c);
            };



            $(this.filepicker).on('Result', function (e, res) {
                if(scope.valid()) {
                    scope._onChange.forEach(function (f){
                        f(scope.getValue());
                    });
                }
            });
            mw.emitter.on([textField, targetField], 'input', function (e){
                if(scope.valid()) {
                    scope._onChange.forEach(function (f){
                        f(scope.getValue());
                    });
                }
            });

            mw.emitter.on(footer.ok, 'click', function (e){
                scope._confirm.forEach(function (f){
                    f(scope.getValue());
                });
            });

            mw.emitter.on(footer.cancel, 'click', function (e){
                scope._cancel.forEach(function (f){
                    f();
                });
            });

            root.append(holder);

            root.append(footer.root);

            this.valid();

            this.root = root;
        },

        url: function (options) {
            var scope = this;
            var defaults = {
                text: {
                    label: mw.lang('Link text'),
                    description: mw.lang('Selected text for the link.'),
                },
                link: {
                    label: mw.lang('Website URL'),
                    description: mw.lang('Type the website URL to link it'),
                    placeholder: "http://",
                },
                target: {
                    label: mw.lang('Open the link in a new window')
                },
                icon: 'mdi mdi-web',
                title: 'URL'
            };
            options =  mw.object.extend(true, {}, defaults, (options || {}));
            this.settings = options;
            if (options.text === true) options.text = defaults.text;
            if (options.link === true) options.link = defaults.link;
            if (options.target === true) options.target = defaults.target;

            var root = document.createElement('div');
            root.className = 'mw-ui-form-controller-root';
            var _linkText = '', _linkUrl = '', _target = '';
            UIFormControllers._title(this.settings, root)
            if (options.text) {
                _linkText = mw.controlFields.field({
                    label: options.text.label,
                    description: options.text.description,
                    name: 'text'
                });
            }
            if (options.link) {
                _linkUrl = mw.controlFields.field({
                    label: options.link.label,
                    description: options.link.description,
                    placeholder: options.link.placeholder,
                    name: 'url'
                });
            }

            if (options.target) {
                _target = mw.controlFields.checkbox({
                    label: options.target.label,
                    name: 'target'
                });
            }


            var holder = document.createElement('div');
            holder.append(_linkText);
            holder.append(_linkUrl);
            holder.append(_target);


            var textField = holder.querySelector('[name="text"]');
            var urlField = holder.querySelector('[name="url"]');
            var targetField = holder.querySelector('[name="target"]');

            this.valid = function () {
                var res = this.isValid();
                footer.ok.disabled = !res;
                return res;
            };

            this.isValid = function () {
                if(textField && !textField.value) {
                    return false;
                }
                if(urlField && !urlField.value) {
                    return false;
                }

                return true;
            };

            var footer = UIFormControllers.footer();

            this.setValue = function (val) {
                val = val || {};
                if(textField) textField.value = val.text || '';
                if(urlField) urlField.value = val.url  || '';
                if(targetField) targetField.checked = val.target  ;
            }
            this.getValue = function () {
                var val = {};
                if(textField) val.text = textField.value;
                if(urlField) val.url = urlField.value;
                if(targetField) val.target = targetField.checked;
                return val;
            };

            this._onChange = [];
            this.onChange = function (c) {
                this._onChange.push(c);
            };

            this._confirm = [];
            this.onConfirm = function (c) {
                this._confirm.push(c);
            };

            this._cancel = [];
            this.onCancel = function (c) {
                this._cancel.push(c);
            };


            mw.emitter.on([textField, urlField, targetField], 'input', function (e){
                if(scope.valid()) {
                    scope._onChange.forEach(function (f){
                        f(scope.getValue());
                    });
                }
            });

            mw.emitter.on(footer.ok, 'click', function (e){
                scope._confirm.forEach(function (f){
                    f(scope.getValue());
                });
            });

            mw.emitter.on(footer.cancel, 'click', function (e){
                scope._cancel.forEach(function (f){
                    f();
                });
            });

            root.append(holder);

            root.append(footer.root);

            this.valid();

            this.root = root;
        }
    };

    mw.UIFormControllers = UIFormControllers;
})();

})();

(() => {
/*!*********************************!*\
  !*** ../widgets/link-editor.js ***!
  \*********************************/

mw.require('widgets.css');
 

    mw.LinkEditor = function(options) {
        var scope = this;
        var defaults = {
            mode: 'dialog',
            controllers: [
                { type: 'url'},
                { type: 'page' },
                { type: 'post' },
                { type: 'file' },
                { type: 'email' },
                { type: 'layout' },
                /*{ type: 'title' },*/
            ],
            title: '<i class="mdi mdi-link mw-link-editor-icon"></i> ' + mw.lang('Link Settings'),
            nav: 'tabs'
        };

        this._confirm = [];
        this.onConfirm = function (c) {
            this._confirm.push(c);
        };

        this._cancel = [];
        this.onCancel = function (c) {
            this._cancel.push(c);
        };

        this.setValue = function (data, controller) {
            controller = controller || 'auto';

            if(controller === 'auto') {
                this.controllers.forEach(function (item){
                    item.controller.setValue(data);
                });
            } else {
                this.controllers.find(function (item){
                    return item.type === controller;
                }).controller.setValue(data);
            }

            return this;
        };
console.log( mw.top().settings, this, this.settings );

        this.settings =  mw.object.extend({}, defaults, options || {});

        console.log( mw.top().settings );

        this.buildNavigation = function (){
            if(this.settings.nav === 'tabs') {
                this.nav = document.createElement('nav');
                 this.nav.className = 'mw-ac-editor-nav';

                var nav = scope.controllers.slice(0, 4);
                var dropdown = scope.controllers.slice(4);

                var handleSelect = function (__for, target) {
                    [].forEach.call(scope.nav.children, function (item){item.classList.remove('active');});
                    scope.controllers.forEach(function (item){item.controller.root.classList.remove('active');});
                    if(target && target.classList) {
                        target.classList.add('active');
                    }
                    __for.controller.root.classList.add('active');
                    if(scope.dialog) {
                        scope.dialog.center();
                    }
                };

                var createA = function (ctrl, index) {
                    var a =  document.createElement('a');
                    a.className = 'mw-ui-btn-tab' + (index === 0 ? ' active' : '');
                    a.innerHTML = ('<i class="'+ctrl.controller.settings.icon+'"></i> '+ctrl.controller.settings.title);
                    a.__for = ctrl;
                    a.onclick = function (){
                        handleSelect(this.__for, this);
                    };
                    return a;
                };


                nav.forEach(function (ctrl, index){
                    scope.nav.appendChild(createA(ctrl, index));
                });
                this.nav.children[0].click();
                this.root.prepend(this.nav);

                if(dropdown.length) {
                    var dropdownElBtn =  document.createElement('div');
                    var dropdownEl =  document.createElement('div');
                      dropdownElBtn.className = 'mw-ui-btn-tab mw-link-editor-more-button';
                      dropdownEl.className = 'mw-link-editor-nav-drop-box';
                      dropdownEl.style.display = 'none';

                    dropdownElBtn.innerHTML = mw.lang('More') + '<i class="mdi mdi-chevron-down"></i>';
                    dropdown.forEach(function (ctrl, index){

                        mw.element(dropdownEl)
                            .append(mw.element({
                                tag: 'span',
                                props: {
                                    className: '',
                                    __for: ctrl,
                                    innerHTML: ('<i class="'+ctrl.controller.settings.icon+'"></i> '+ctrl.controller.settings.title),
                                    onclick: function () {
                                         handleSelect(this.__for);
                                        mw.element(dropdownEl).hide();
                                    }
                                }
                            }));
                    });
                    this.nav.append(dropdownEl);
                    this.nav.append(dropdownElBtn);
                    dropdownElBtn.onclick = function (){
                        mw.element(dropdownEl).toggle();
                    };

                    dropdownEl.onchange = function () {
                        handleSelect(this.options[this.selectedIndex].__for);
                    };
                    /*setTimeout(function (){
                        if($.fn.selectpicker) {
                            $('.selectpicker').selectpicker();
                        }
                    }, 100)*/
                }
            }

        };

        this.buildControllers = function (){
            this.controllers = [];
            this.settings.controllers.forEach(function (item) {
                if(mw.UIFormControllers[item.type]) {
                    var ctrl = new mw.UIFormControllers[item.type](item.config);
                    scope.root.appendChild(ctrl.root);
                    scope.controllers.push({
                        type: item.type,
                        controller: ctrl
                    });
                    ctrl.onConfirm(function (data){
                        scope._confirm.forEach(function (f){
                            f(data);
                        });
                    });
                    ctrl.onCancel(function (){
                        scope._cancel.forEach(function (f){
                            f();
                        });
                    });
                }

            });
        };
        this.build = function (){
            this.root = document.createElement('div');
            this.root.onclick = function (e) {
                var le2 = mw.tools.firstParentOrCurrentWithAnyOfClasses(e.target, ['mw-link-editor-nav-drop-box', 'mw-link-editor-more-button']);
                if(!le2) {
                    mw.element('.mw-link-editor-nav-drop-box').hide();
                }
            };

            this.root.className = 'mw-link-editor-root mw-link-editor-root-inIframe-' + (window.self !== window.top )
            this.buildControllers ();
            if(this.settings.mode === 'dialog') {
                this.dialog = mw.dialog({
                    content: this.root,
                    height: 'auto',
                    title: this.settings.title,
                    overflowMode: 'visible',
                    shadow: false
                });
                this.dialog.center();
                this.onConfirm(function (){
                    scope.dialog.remove();
                });
                this.onCancel(function (){
                    scope.dialog.remove();
                });
            } else if(this.settings.mode === 'element') {
                this.settings.element.append(this.root);
            }
        };
        this.init = function(options) {
            this.build();
            this.buildNavigation();
        };
        this.init();
        this.promise = function () {
            return new Promise(function (resolve){
                scope.onConfirm(function (data){
                    resolve(data);
                });
                scope.onCancel(function (){
                    resolve();
                });
            });
        };
    };



})();

(() => {
/*!**************************!*\
  !*** ../widgets/tags.js ***!
  \**************************/


mw.coreIcons = {
    category:'mw-icon-category',
    page:'mw-icon-page',
    home:'mw-icon-home',
    shop:'mai-market2',
    post:'mai-post'
};


mw.tags = mw.chips = function(options){

    "use strict";

    options.element = mw.$(options.element)[0];
    options.size = options.size || 'sm';

    this.options = options;
    this.options.map = this.options.map || { title: 'title', value: 'id', image: 'image', icon: 'icon' };
    this.map = this.options.map;
    var scope = this;
    /*
        data: [
            {title:'Some tag', icon:'<i class="icon"></i>'},
            {title:'Some tag', icon:'icon', image:'http://some-image/jpg.png'},
            {title:'Some tag', color:'warn'},
        ]
    */


    this.refresh = function(){
        mw.$(scope.options.element).empty();
        this.rend();
    };

    this.setData = function(data){
        this.options.data = data;
        this.refresh();
    };
    this.rend = function(){
        $.each(this.options.data, function(i){
            var data = $.extend({index:i}, this);
            scope.options.element.appendChild(scope.tag(data));
        });
        if(this.options.inputField) {
            scope.options.element.appendChild(this.addInputField());
        }
    };

    this.addInputField = function () {
        this._field = document.createElement('input');
        this._field.className = 'mw-ui-invisible-field mw-ui-field-' + this.options.size;
        this._field.onkeydown = function (e) {
            if(mw.event.is.enter(e)) {
                var val = scope._field.value.trim();
                if(val) {
                    scope.addTag({
                        title: val
                    });
                }
            }
        };
        return this._field;
    };



    this.dataValue = function(data){
        if(typeof data === 'string'){
            return data;
        }
        else{
            return data[this.map.value]
        }
    };

    this.dataImage = function(data){
        if(data[this.map.image]){
            var img = document.createElement('span');
            img.className = 'mw-ui-btn-img';
            img.style.backgroundImage = 'url('+data.image+')';
            return img;
        }
    };

    this.dataTitle = function(data){
        if(typeof data === 'string'){
            return data;
        }
        else{
            return data[this.map.title];
        }
    };

    this.dataIcon = function(data){
        if(typeof data === 'string'){
            return;
        }
        else{
            return data[this.map.icon]
        }
    };


     this.createImage = function (config) {
         var img = this.dataImage(config);
        if(img){
            return img;
        }
     };
     this.createIcon = function (config) {
        var ic = this.dataIcon(config);

        if(!ic && config.type){
            ic = mw.coreIcons[config.type];

        }
        var icon;
        if(typeof ic === 'string' && ic.indexOf('<') === -1){
            icon = document.createElement('i');
            icon.className = ic;
        }
        else{
            icon = ic;
        }

        return mw.$(icon)[0];
     };

     this.removeTag = function (index) {
        var item = this.options.data[index];
        this.options.data.splice(index,1);
        this.refresh();
        mw.$(scope).trigger('tagRemoved', [item, this.options.data]);
        mw.$(scope).trigger('change', [item, this.options.data]);
     };

    this.addTag = function(data, index){
        index = typeof index === 'number' ? index : this.options.data.length;
        this.options.data.splice( index, 0, data );
        this.refresh();
        mw.$(scope).trigger('tagAdded', [data, this.options.data]);
        mw.$(scope).trigger('change', [data, this.options.data]);
    };

     this.tag = function (options) {
            var config = {
                close:true,
                tagBtnClass:'btn btn-' + this.options.size
            };

            $.extend(config, options);

         config.tagBtnClass +=  ' mb-2 mr-2 btn';

         if (this.options.outline){
             config.tagBtnClass +=  '-outline';
         }

         if (this.options.color){
             config.tagBtnClass +=  '-' + this.options.color;
         }



         if(this.options.rounded){
             config.tagBtnClass +=  ' btn-rounded';
         }


            var tag_holder = document.createElement('span');
            var tag_close = document.createElement('span');

            tag_close._index = config.index;
            tag_holder._index = config.index;
            tag_holder._config = config;
            tag_holder.dataset.index = config.index;

            tag_holder.className = config.tagBtnClass;

             if(options.image){

             }

            tag_holder.innerHTML = '<span class="tag-label-content">' + this.dataTitle(config) + '</span>';

             if(typeof this.options.disableItem === 'function') {
                 if(this.options.disableItem(config)){
                     tag_holder.className += ' disabled';
                 }
             }
             if(typeof this.options.hideItem === 'function') {
                 if(this.options.hideItem(config)){
                     tag_holder.className += ' hidden';
                 }
             }

            var icon = this.createIcon(config);

            var image = this.createImage(config);

             if(image){
                 mw.$(tag_holder).prepend(image);
             }
             if(icon){
                 mw.$(tag_holder).prepend(icon);
             }


            tag_holder.onclick = function (e) {
                if(e.target !== tag_close){
                    mw.$(scope).trigger('tagClick', [this._config, this._index, this])
                }
            };

            tag_close.className = 'mw-icon-close ml-1';
            if(config.close){
                tag_close.onclick = function () {
                    scope.removeTag(this._index);
                };
            }
            tag_holder.appendChild(tag_close);
            return tag_holder;
        };

     this.init = function () {
         this.rend();
         $(this.options.element).on('click', function (e) {
             if(e.target === scope.options.element){
                 $('input', this).focus();
             }
         })
     };
    this.init();
};

mw.treeTags = mw.treeChips = function(options){
    this.options = options;
    this.options.on = this.options.on || {};
    var scope = this;

    var tagsHolder = options.tagsHolder || mw.$('<div class="mw-tree-tag-tags-holder"></div>');
    var treeHolder = options.treeHolder || mw.$('<div class="mw-tree-tag-tree-holder"></div>');

    var treeSettings = $.extend({}, this.options, {element:treeHolder});
    var tagsSettings = $.extend({}, this.options, {element:tagsHolder, data:this.options.selectedData || []});

    this.tree = new mw.tree(treeSettings);

    this.tags = new mw.tags(tagsSettings);

    mw.$( this.options.element ).append(tagsHolder);
    mw.$( this.options.element ).append(treeHolder);

     mw.$(this.tags).on('tagRemoved', function(event, item){
         scope.tree.unselect(item);
     });
     mw.$(this.tree).on('selectionChange', function(event, selectedData){
        scope.tags.setData(selectedData);
        if (scope.options.on.selectionChange) {
            scope.options.on.selectionChange(selectedData)
        }
    });

};

})();

(() => {
/*!**************************!*\
  !*** ../widgets/tree.js ***!
  \**************************/

/********************************************************


 var myTree = new mw.tree({

});


 ********************************************************/




(function(){
    mw.lib.require('jqueryui');

    mw.lib.require('nestedsortable');



    var mwtree = function(config){

        var scope = this;

        this.config = function(config){

            window.mwtree = (typeof window.mwtree === 'undefined' ? 0 : window.mwtree)+1;

            if(!config.id && typeof config.saveState === undefined){
                config.saveState = false;
            }

            var defaults = {
                data:[],
                openedClass:'opened',
                selectedClass:'selected',
                skin:'default',
                multiPageSelect:true,
                saveState:true,
                stateStorage: {
                    get: function (id) {
                        return mw.storage.get( id);
                    },
                    set: function (id, dataToSave) {
                        mw.storage.set(id, dataToSave);
                    }
                },
                sortable:false,
                nestedSortable:false,
                singleSelect:false,
                selectedData:[],
                skip:[],
                contextMenu:false,
                append:false,
                prepend:false,
                selectable:false,
                filter:false,
                cantSelectTypes: [],
                document: document,
                _tempRender: true,
                filterRemoteURL: null,
                filterRemoteKey: 'keyword',
            };


            var options = $.extend({}, defaults, config);



            options.element = mw.$(options.element)[0];
            options.data = options.data || [];

            this.options = options;
            this.document = options.document;
            this._selectionChangeDisable = false;

            this.stateStorage = this.options.stateStorage;

            if(this.options.selectedData){
                this.selectedData = this.options.selectedData;
            }
            else{
                this.selectedData = [];
            }
        };
        this.filterLocal = function(val, key){
            key = key || 'title';
            val = (val || '').toLowerCase().trim();
            if(!val){
                scope.showAll();
            }
            else{
                scope.options.data.forEach(function(item){
                    if(item[key].toLowerCase().indexOf(val) === -1){
                        scope.hide(item);
                    }
                    else{
                        scope.show(item);
                    }
                });
            }
        };

        this._filterRemoteTime = null;
        this.filterRemote = function(val, key){
            clearTimeout(this._filterRemoteTime);
            this._filterRemoteTime = setTimeout(function () {
                key = key || 'title';
                val = (val || '').toLowerCase().trim();
                var ts = {};
                ts[scope.options.filterRemoteKey] = val;
                $.get(scope.options.filterRemoteURL, ts, function (data) {
                    scope.setData(data);
                });
            }, 777);
        };

        this.filter = function(val, key){
            if (!!this.options.filterRemoteURL && !!this.options.filterRemoteKey) {
                this.filterRemote(val, key);
            } else {
                this.filterLocal(val, key);
            }
        };

        var _e = {};

        this.on = function (e, f) { _e[e] ? _e[e].push(f) : (_e[e] = [f]) };
        this.dispatch = function (e, f) { _e[e] ? _e[e].forEach(function (c){ c.call(this, f); }) : ''; };

        this.search = function(){
            this._seachInput = mw.$(this.options.searchInput);
            if(!this._seachInput[0] || this._seachInput[0]._tree) return;
            this._seachInput[0]._tree = this;
            var scope = this;
            this._seachInput.on('input', function(){
                scope.filter(this.value);
            });
        };
        this.skip = function(itemData){
            if(this.options.skip && this.options.skip.length>0){
                for( var n=0; n<scope.options.skip.length; n++ ){
                    var item = scope.options.skip[n];
                    var case1 = (item.id == itemData.id && item.type == itemData.type);
                    var case2 = (itemData.parent_id == item.id && item.type == itemData.type);
                    if(case1 ||case2){
                        return true;
                    }
                }
                return false;
            }
        };
        this.prepareData = function(){
            if(typeof this.options.filter === 'object'){
                var final = [], scope = this;
                for( var i in this.options.filter){
                    $.each(this.options.data, function(){
                        if(this[i] && this[i] == scope.options.filter[i]){
                            final.push(this);
                        }
                    });
                }
                this.options.data = final;
            }
        };


        this._postCreated = [];

        this.json2ul = function(){
            this.list = scope.document.createElement( 'ul' );
            this.list._tree = this;
            this.options.id = this.options.id || ( 'mw-tree-' + window.mwtree );
            this.list.id = this.options.id;
            this.list.className = 'mw-defaults mw-tree-nav mw-tree-nav-skin-' + this.options.skin;
            this.list._id = 0;
            this.options.data.forEach(function(item){
                var list = scope.getParent(item);
                if(list){
                    var li = scope.createItem(item);
                    if(li){
                        list.appendChild(li);
                    }
                }
                else if(typeof list === 'undefined'){
                    scope._postCreated.push(item);
                }
            });
            if(this.options._tempRender) {
                this.tempRend();
            }
        };



        this._tempPrepare = function () {
            for (var i=0; i<this._postCreated.length; i++) {
                var it = this._postCreated[i];
                if(it.parent_id !== 0) {
                    var has = this.options.data.find(function (a) {
                        return a.id ==  it.parent_id; // 1 == '1'
                    });
                    if(!has) {
                        it.parent_id = 0;
                        it.parent_type = "page";
                    }
                }
            }
        };

        this.tempRend = function () {
            this._tempPrepare()
            var curr = scope._postCreated[0];
            var max = 10000, itr = 0;

            while(scope._postCreated.length && itr<max){
                itr++;
                var index = scope._postCreated.indexOf(curr);
                var selector = '#' + scope.options.id + '-' + curr.type + '-'  + curr.id;
                var lastc = selector.charAt(selector.length - 1);
                if( lastc === '.' || lastc === '#') {
                    selector = selector.substring(0, selector.length - 1);
                }
                var it = mw.$(selector)[0];
                if(it){
                    scope._postCreated.splice(index, 1);
                    curr = scope._postCreated[0];
                    continue;
                }
                var list = scope.getParent(curr);

                if(list && !$(selector)[0]){
                    var li = scope.createItem(curr);
                    if(li){
                        list.appendChild(li);
                    }
                    scope._postCreated.splice(index, 1);
                    curr = scope._postCreated[0];
                }
                else if(typeof list === 'undefined'){
                    curr = scope._postCreated[index+1] || scope._postCreated[0];
                }
            }

        };

        function triggerChange() {
            if(!this._selectionChangeDisable) {
                mw.$(scope).trigger('selectionChange', [scope.selectedData]);
                scope.dispatch('selectionChange', scope.selectedData)
            }
        }

        this.setData = function(newData){
            this.options.data = newData;
            this._postCreated = [];
            this._ids = [];
            this.init();
        };

        this.saveState = function(){
            if(!this.options.saveState) return;
            var data = [];
            mw.$( 'li.' + this.options.openedClass, this.list  ).each(function(){
                if(this._data) {
                    data.push({type:this._data.type, id:this._data.id})
                }
            });

            this.stateStorage.set(this.options.id, data);
        };

        this.restoreState = function(){
            if(!this.options.saveState) return;
            var data = this.stateStorage.get(this.options.id);
            if(!data) return;
            try{
                $.each(data, function(){
                    if(typeof this.id === 'string'){
                        this.id = parseInt(this.id, 10);
                    }
                    scope.open(this.id, this.type);
                });
            }
            catch(e){ }
        };

        this.manageUnselected = function(){
            mw.$('input:not(:checked)', this.list).each(function(){
                var li = scope.parentLi(this);
                mw.$(li).removeClass(scope.options.selectedClass)
            });
        };

        this.analizeLi = function(li){
            if(typeof li === 'string'){
                li = decodeURIComponent(li).trim();
                if(/^\d+$/.test(li)){
                    li = parseInt(li, 10);
                }
                else{
                    return mw.$(li)[0];
                }
            }
            return li;
        };

        this.select = function(li, type){
            if(Array.isArray(li)){
                $.each(li, function(){
                    scope.select(this);
                });
                return;
            }
            li = this.get(li, type);
            if(li && this.options.cantSelectTypes.indexOf(li.dataset.type) === -1){
                li.classList.add(this.options.selectedClass);
                var input = li.querySelector('input');
                if(input) input.checked = true;
            }

            this.manageUnselected();
            this.getSelected();
            triggerChange();
        };



        this.unselect = function(li, type){
            if(Array.isArray(li)){
                $.each(li, function(){
                    scope.unselect(this);
                });
                return;
            }
            li = this.get(li, type);
            if(li){
                li.classList.remove(this.options.selectedClass);
                var input = li.querySelector('input');
                if(input) input.checked = false;
            }
            this.manageUnselected();
            this.getSelected();
            triggerChange();
        };

        this.get = function(li, type){
            if(typeof li === 'undefined') return false;
            if(li === null) return false;
            if(li.nodeType) return li;
            li = this.analizeLi(li);
            if(typeof li === 'object' && typeof li.id !== 'undefined'){
                return this.get(li.id, li.type);
            }
            if(typeof li === 'object' && li.constructor === Number){
                li = parseInt(li);
            }
            if(typeof li === 'number'){
                if(!type) return;
                return this.list.querySelector('li[data-type="'+type+'"][data-id="'+li+'"]');
            }
            if(typeof li === 'string' && /^\d+$/.test(li)){
                if(!type) return;
                return this.list.querySelector('li[data-type="'+type+'"][data-id="'+li+'"]');
            }
            //if(!li) {console.warn('List item not defined:', li, type)}
            return li;
        };

        this.isSelected = function(li, type){
            li = this.get(li, type);
            if(!li) return;
            var input = li.querySelector('input');
            if(!input) return false;
            return input.checked === true;
        };
        this.toggleSelect = function(li, type){
            if(this.isSelected(li, type)){
                this.unselect(li, type)
            }
            else{
                this.select(li, type)
            }
        };

        this.selectAll = function(){
            this._selectionChangeDisable = true;
            this.select(this.options.data);
            this._selectionChangeDisable = false;
            triggerChange()
        };

        this.unselectAll = function(){
            this._selectionChangeDisable = true;
            this.unselect(this.selectedData);
            this._selectionChangeDisable = false;
            triggerChange()
        };

        this.open = function(li, type, _skipsave){
            if(Array.isArray(li)){
                $.each(li, function(){
                    scope.open(this);
                });
                return;
            }
            li = this.get(li, type);
            if(!li) return;
            li.classList.add(this.options.openedClass);
            if(!_skipsave) this.saveState();
        };
        this.show = function(li, type){
            if(Array.isArray(li)){
                $.each(li, function(){
                    scope.show(this);
                });
                return;
            }
            li = this.get(li, type);
            if(!li) return;
            li.classList.remove('mw-tree-item-hidden');
            mw.$(li).parents(".mw-tree-item-hidden").removeClass('mw-tree-item-hidden').each(function(){
                scope.open(this);
            });
        };

        this.showAll = function(){
            mw.$(this.list.querySelectorAll('li')).removeClass('mw-tree-item-hidden');
        };

        this.hide = function(li, type){
            if(Array.isArray(li)){
                $.each(li, function(){
                    scope.hide(this);
                });
                return;
            }
            li = this.get(li, type);
            if(!li) return;
            li.classList.add('mw-tree-item-hidden');
        };

        this.hideAll = function(){
            mw.$(this.list.querySelectorAll('li')).addClass('mw-tree-item-hidden');
        };

        this.close = function(li,type, _skipsave){
            if(Array.isArray(li)){
                $.each(li, function(){
                    scope.close(this);
                });
                return;
            }
            li = this.get(li, type);
            if(!li) return;
            li.classList.remove(this.options.openedClass);
            if(!_skipsave) this.saveState();
        };

        this.toggle = function(li, type){
            li = this.get(li, type);
            if(!li) return;
            li.classList.toggle(this.options.openedClass);
            this.saveState();
        };

        this.openAll = function(){
            var all = this.list.querySelectorAll('li');
            mw.$(all).each(function(){
                scope.open(this, undefined, true);
            });
            this.saveState();
        };

        this.closeAll = function(){
            var all = this.list.querySelectorAll('li.'+this.options.openedClass);
            mw.$(all).each(function(){
                scope.close(this, undefined, true);
            });
            this.saveState();
        };

        this.button = function(){
            var btn = scope.document.createElement('mwbutton');
            btn.className = 'mw-tree-toggler';
            btn.onclick = function(){
                scope.toggle(mw.tools.firstParentWithTag(this, 'li'));
            };
            return btn;
        };

        this.addButtons = function(){
            var all = this.list.querySelectorAll('li ul.pre-init'), i=0;
            for( ; i<all.length; i++ ){
                var ul = all[i];
                ul.classList.remove('pre-init');
                mw.$(ul).parent().children('.mw-tree-item-content-root').prepend(this.button());
            }
        };

        this.checkBox = function(element){
            if(this.options.cantSelectTypes.indexOf(element.dataset.type) !== -1){
                return scope.document.createTextNode('');
            }
            var itype = 'radio';
            if(this.options.singleSelect){

            }
            else if(this.options.multiPageSelect || element._data.type !== 'page'){
                itype = 'checkbox';
            }
            var label = scope.document.createElement('tree-label');
            var input = scope.document.createElement('input');
            var span = scope.document.createElement('span');
            input.type = itype;
            input._data = element._data;
            input.value = element._data.id;
            input.name = this.list.id;
            label.className = 'mw-ui-check';

            label.appendChild(input);


            label.appendChild(span);

            /*input.onchange = function(){
                var li = scope.parentLi(this);
                mw.$(li)[this.checked?'addClass':'removeClass'](scope.options.selectedClass)
                var data = scope.getSelected();
                scope.manageUnselected()
                mw.$(scope).trigger('change', [data]);
            }*/
            return label;
        };

        this.parentLi = function(scope){
            if(!scope) return;
            if(scope.nodeName === 'LI'){
                return scope;
            }
            while(scope.parentNode){
                scope = scope.parentNode;
                if(scope.nodeName === 'LI'){
                    return scope;
                }
            }
        };

        this.getSelected = function(){
            var selected = [];
            var all = this.list.querySelectorAll('li.selected');
            mw.$(all).each(function(){
                if(this._data) selected.push(this._data);
            });
            this.selectedData = selected;
            this.options.selectedData = selected;
            return selected;
        };

        this.decorate = function(element){
            if(this.options.selectable){
                mw.$(element.querySelector('.mw-tree-item-content')).prepend(this.checkBox(element))
            }

            element.querySelector('.mw-tree-item-content').appendChild(this.contextMenu(element));

            if(this.options.sortable){
                this.sortable();
            }
            if(this.options.nestedSortable){
                this.nestedSortable();
            }

        };

        this.sortable = function(element){
            var items = mw.$(this.list);
            mw.$('ul', this.list).each(function () {
                items.push(this);
            });
            items.sortable({
                items: ".type-category, .type-page",
                axis:'y',
                listType:'ul',
                handle:'.mw-tree-item-title',
                update:function(e, ui){
                    setTimeout(function(){
                        var old = $.extend({},ui.item[0]._data);
                        var obj = ui.item[0]._data;
                        var objParent = ui.item[0].parentNode.parentNode._data;
                        ui.item[0].dataset.parent_id = objParent ? objParent.id : 0;

                        obj.parent_id = objParent ? objParent.id : 0;
                        obj.parent_type = objParent ? objParent.id : 'page';
                        var newdata = [];
                        mw.$('li', scope.list).each(function(){
                            if(this._data) newdata.push(this._data)
                        });
                        scope.options.data = newdata;
                        var local = [];
                        mw.$(ui.item[0].parentNode).children('li').each(function(){
                            if(this._data) {
                                local.push(this._data.id);
                            }
                        });
                        //$(scope.list).remove();
                        //scope.init();
                        mw.$(scope).trigger('orderChange', [obj, scope.options.data, old, local])
                    }, 110);

                }
            });
        };
        this.nestedSortable = function(element){
            mw.$('ul', this.list).nestedSortable({
                items: ".type-category",
                listType:'ul',
                handle:'.mw-tree-item-title',
                update:function(e, ui){

                }
            })
        };

        this.contextMenu = function(element){
            var menu = scope.document.createElement('span');
            menu.className = 'mw-tree-context-menu';
            if(this.options.contextMenu){
                $.each(this.options.contextMenu, function(){
                    var menuitem = scope.document.createElement('span');
                    var icon = scope.document.createElement('span');
                    menuitem.title = this.title;
                    menuitem.className = 'mw-tree-context-menu-item';
                    icon.className = this.icon;
                    menuitem.appendChild(icon);
                    menu.appendChild(menuitem);
                    (function(menuitem, element, obj){
                        menuitem.onclick = function(){
                            if(obj.action){
                                obj.action.call(element, element, element._data, menuitem)
                            }
                        }
                    })(menuitem, element, this);
                });
            }
            return menu

        };

        this.rend = function(){
            if(this.options.element){
                var el = mw.$(this.options.element);
                if(el.length!==0){
                    el.empty().append(this.list);
                }
            }
        };

        this._ids = [];

        this._createSingle = function (item) {

        }

        this.createItem = function(item){
            var selector = '#'+scope.options.id + '-' + item.type+'-'+item.id;
            if(this._ids.indexOf(selector) !== -1) return false;
            this._ids.push(selector);
            var li = scope.document.createElement('li');
            li.dataset.type = item.type;
            li.dataset.id = item.id;
            li.dataset.parent_id = item.parent_id;
            var skip = this.skip(item);
            li.className = 'type-' + item.type + ' subtype-'+ item.subtype + ' skip-' + (skip || 'none');
            var container = scope.document.createElement('span');
            container.className = "mw-tree-item-content";
            container.innerHTML = '<span class="mw-tree-item-title">'+item.title+'</span>';

            li._data = item;
            li.id = scope.options.id + '-' + item.type+'-'+item.id;
            li.appendChild(container);
            $(container).wrap('<span class="mw-tree-item-content-root"></span>')
            if(!skip){
                container.onclick = function(){
                    if(scope.options.selectable) scope.toggleSelect(li)
                };
                this.decorate(li);
            }


            return li;
        };



        this.additional = function (obj) {
            var li = scope.document.createElement('li');
            li.className = 'mw-tree-additional-item';
            var container = scope.document.createElement('span');
            var containerTitle = scope.document.createElement('span');
            container.className = "mw-tree-item-content";
            containerTitle.className = "mw-tree-item-title";
            container.appendChild(containerTitle);

            li.appendChild(container);
            $(container).wrap('<span class="mw-tree-item-content-root"></span>')
            if(obj.icon){
                if(obj.icon.indexOf('</') === -1){
                    var icon = scope.document.createElement('span');
                    icon.className = 'mw-tree-aditional-item-icon ' + obj.icon;
                    containerTitle.appendChild(icon);
                }
                else{
                    mw.$(containerTitle).append(obj.icon)
                }

            }
            var title = scope.document.createElement('span');
            title.innerHTML = obj.title;
            containerTitle.appendChild(title);
            li.onclick = function (ev) {
                if(obj.action){
                    obj.action.call(this, obj)
                }
            };
            return li;
        }

        this.createList = function(item){
            var nlist = scope.document.createElement('ul');
            nlist.dataset.type = item.parent_type;
            nlist.dataset.id = item.parent_id;
            nlist.className = 'pre-init';
            return nlist;
        };

        this.getParent = function(item, isTemp){
            if(!item.parent_id) return this.list;
            var findul = this.list.querySelector('ul[data-type="'+item.parent_type+'"][data-id="'+item.parent_id+'"]');
            var findli = this.list.querySelector('li[data-type="'+item.parent_type+'"][data-id="'+item.parent_id+'"]');
            if(findul){
                return findul;
            }
            else if(findli){
                var nlistwrap = this.createItem(item);
                if(!nlistwrap) return false;
                var nlist = this.createList(item);
                nlist.appendChild(nlistwrap);
                findli.appendChild(nlist);
                return false;
            }
        };

        this.append = function(){
            if(this.options.append){
                $.each(this.options.append, function(){
                    scope.list.appendChild(scope.additional(this))
                })
            }
        };

        this.prepend = function(){
            if(this.options.prepend){
                $.each(this.options.append, function(){
                    mw.$(scope.list).prepend(scope.additional(this))
                })
            }
        };

        this.addHelperClasses = function(root, level){
            level = (level || 0) + 1;
            root = root || this.list;
            mw.$( root.children ).addClass('level-'+level).each(function(){
                var ch = this.querySelector('ul');
                if(ch){
                    mw.$(this).addClass('has-children')
                    scope.addHelperClasses(ch, level);
                }
            })
        };

        this.loadSelected = function(){
            if(this.selectedData){
                scope.select(this.selectedData);
            }
        };
        this.init = function(){

            this.prepareData();
            this.json2ul();
            this.addButtons();
            this.rend();
            this.append();
            this.prepend();
            this.addHelperClasses();
            this.restoreState();
            this.loadSelected();
            this.search();
            setTimeout(function(){
                mw.$(scope).trigger('ready');
            }, 78)
        };

        this.config(config);
        this.init();
    };
    mw.tree = mwtree;
    mw.tree.get = function (a) {
        a = mw.$(a)[0];
        if(!a) return;
        if(mw.tools.hasClass(a, 'mw-tree-nav')){
            return a._tree;
        }
        var child = a.querySelector('.mw-tree-nav');
        if(child) return child._tree;
        var parent = mw.tools.firstParentWithClass(a, 'mw-tree-nav');

        if(parent) {
            return parent._tree;
        }
    }


})();

})();

/******/ })()
;
//# sourceMappingURL=admin.js.map