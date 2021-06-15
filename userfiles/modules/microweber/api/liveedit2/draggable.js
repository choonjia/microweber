
import {ObjectService} from './object.service';
import {DroppableElementAnalyzerService} from "./analizer";
 import {DropPosition} from "./drop-position";

export const Draggable = function (options, rootSettings) {
    var defaults = {
        handle: null,
        element: null,
        target: document.body,
        targetDocument: document,
        helper: true
    };
    var scope = this;

    var _e = {};

    this.on = function (e, f) { _e[e] ? _e[e].push(f) : (_e[e] = [f]) };
    this.dispatch = function (e, f) { _e[e] ? _e[e].forEach(function (c){ c.call(this, f); }) : ''; };

    var stop = true;

    var scroll = function (step) {
        scope.settings.targetDocument.body.style.scrollBehavior = 'smooth';
        scope.settings.targetDocument.defaultView.scrollTo(0,scrollY + step);
    }

    this.config = function () {
        this.settings = ObjectService.extend({}, defaults, options);
        this.setElement(this.settings.element);
        this.dropIndicator = this.settings.dropIndicator;
    };
    this.setElement = function (node) {
        this.element = mw.element(node)/*.prop('draggable', true)*/.get(0);
        if(!this.settings.handle) {
            this.settings.handle = this.settings.element;
        }
        this.handle = this.settings.handle;
    };

    this.setTargets = function (targets) {
        this.targets = mw.element(targets);
    };

    this.addTarget = function (target) {
        this.targets.push(target);
    };

    this.init = function () {
        this.config();
        this.draggable();
    };

    this.helper = function (e) {
        if(!this._helper) {
            this._helper = document.createElement('div');
            this._helper.className = 'mw-draggable-helper';
            document.body.appendChild(this._helper);
        }
        if (e === 'create') {
            this._helper.style.top = e.pageY + 'px';
            this._helper.style.left = e.pageX + 'px';
            this._helper.style.width = scope.element.offsetWidth + 'px';
            this._helper.style.height = scope.element.offsetHeight + 'px';

            this._helper.style.display = 'block';
        } else if(e === 'remove' && this._helper) {
            this._helper.style.display = 'none';
        } else if(this.settings.helper && e) {
            this._helper.style.top = e.pageY + 'px';
            this._helper.style.left = e.pageX + 'px';
            this._helper.style.maxWidth = (innerWidth - e.pageX) + 'px';
        }
        return this._helper;
    };

    this.isDragging = false;
    this.dropableService = new DroppableElementAnalyzerService(rootSettings);


    this.dropPosition = DropPosition;

    this.draggable = function () {
         mw.element(this.settings.target).on('dragover', function (e) {
             scope.target = null;
             scope.action = null;
             if(e.target !== scope.element || !scope.element.contains(e.target)) {
                 var targetAction = scope.dropableService.getTarget(e.target)

                 if(targetAction && targetAction !== scope.element) {
                     const pos = scope.dropPosition(e, targetAction);
                     if(pos) {
                         scope.target = targetAction.target;
                         scope.action = pos.action;
                         scope.dropIndicator.position(scope.target, pos.action + '-' + pos.position)
                     } else {

                         scope.dropIndicator.hide()
                     }

                 } else {
                     scope.dropIndicator.hide()
                 }
                 if (scope.isDragging) {
                     scope.dispatch('dragOver', {element: scope.element, event: e});
                     e.preventDefault();
                 }
             }


        }).on('drop', function (e) {
            if (scope.isDragging) {
                e.preventDefault();
                if (scope.target && scope.action) {
                    mw.element(scope.target)[scope.action](scope.element);
                }

                scope.dispatch('drop', {element: scope.element, event: e});
            }
             scope.dropIndicator.hide();
        });
        this.handle
            .on('dragstart', function (e) {
                scope.isDragging = true;
                if(!scope.element.id) {
                    scope.element.id = ('mw-element-' + new Date().getTime());
                }
                scope.element.classList.add('mw-element-is-dragged');
                e.dataTransfer.setData("text", scope.element.id);
                scope.helper('create');
                scope.dispatch('dragStart',{element: scope.element, event: e});
            })
            .on('drag', function (e) {
                var scrlStp = 90;
                var step = 5;
                if (e.clientY < scrlStp) {
                    scroll(-step)
                }
                if (e.clientY > (innerHeight - (scrlStp + ( this._helper ? this._helper.offsetHeight + 10 : 0)))) {
                    scroll(step)
                }
                scope.dispatch('drag',{element: scope.element, event: e});
                scope.helper(e)
            })
            .on('dragend', function (e) {
                scope.isDragging = false;
                scope.element.classList.remove('mw-element-is-dragged');
                scope.helper('remove');
                scope.dispatch('dragEnd',{element: scope.element, event: e});
                stop = true;
            });
    };
    this.init();
};