'use strict';

(function(w) {
                
    var iframeMediator = (function() {
                    
        var parentId, source, methods;
        var a = document.createElement('a');
        a.href = document.location.toString();
        var origin = a.origin;
        // add listener to listen messages from parent window
        window.addEventListener("message", function(event) {
            if(event.data.parentId) {
                parentId = event.data.parentId;
                methods = event.data.methods;
                source = event.source;
                // send content height to parent window on upload
                event.source.postMessage({
                    channel: parentId,
                    callback: "setContentHeight",
                    args: contentHeight()
                },'*');
            }
        }, false);
        
        // calculate content Height
        var contentHeight = function() {
            var B = document.body,
                H = document.documentElement,
                height

            //height = Math.max( B.scrollHeight, B.offsetHeight, H.clientHeight, H.scrollHeight, H.offsetHeight );
            height = Math.max( B.offsetHeight, H.offsetHeight );
            return height;
        };
                    
        return {
        
            createFrame: function(el,controller,resize) {
                            
                var listener = function(event) {
                    if(event.origin === origin) {
                        if(event.data.channel === el.id && event.data.callback && typeof(controller[event.data.callback]) === 'function') {
                            controller[event.data.callback](event.data.args);
                        }
                    } else {
                        console.error('Пшшшеееелллл вон!');
                    }
                };
                
                return (function() {
                    // add some dafaults methods
                    // resize iframe to content height if resize flag === true
                    controller.setContentHeight = function(args) {
                        this.contentHeight = args;
                        if(resize===true) {
                            this.resizeContentHeight(args);
                        }
                    };
                    controller.resizeContentHeight = function(args) {
                        el.height = (args || this.contentHeight || el.height )+"px";
                    };
                    var iframe = {
                        el: el,
                        controller: controller,
                        init: function() {
                            var msg = {
                                parentId: el.id,
                                methods: Object.keys(controller)
                            };
                            this.el.addEventListener('load',function() {
                                el.contentWindow.postMessage(msg,origin);
                            });
                            this.el.contentWindow.postMessage(msg,origin);
                            window.addEventListener("message",this.listener,false);
                        },
                        destroy: function() {
                            window.removeEventListener("message",this.listener,false);
                        },
                        setSrc: function(src) {
                            this.el.src = src;
                        },
                        listener: listener
                    };
                    return iframe;
                })();
            },
            postMessage: function(msg) {
                if(methods.indexOf(msg.callback)!=-1) {
                    source.postMessage({
                        channel: parentId,
                        callback: msg.callback,
                        args: msg.args
                    },'*');
                } else {
                    console.error('Undefined parent controller method - '+msg.callback);
                }
            }
        };
    })();
    
    w.iframeMediator = iframeMediator;
})(window);