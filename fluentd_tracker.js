$(document).ready(function(){
	var Fluentd_INPUT_PREFIX = 'http' + (('https:' === document.location.protocol ? 's' : '')) + '://',
        Fluentd_COLLECTOR_DOMAIN = '165.227.185.207:9880',
        // Fluentd_SESSION_KEY = '',
        // Fluentd_SESSION_KEY_LENGTH = Fluentd_SESSION_KEY.length + 1,
        // Fluentd_PROXY_DOMAIN = '';


    function FluentdTracker() {
        this.key = false;
        this.sendConsoleErrors = false;
        this.tag = 'fluentd_logger';
        this.useDomainProxy = false;
        this.useUtfEncoding = false;
    }

    function setKey(tracker, key) {
        tracker.key = key;
        tracker.setSession();
        // setInputUrl(tracker);
    }

    function setTag(tracker, tag) {
        tracker.tag = tag;
    }

    function setSendConsoleError(tracker, sendConsoleErrors) {
        tracker.sendConsoleErrors = sendConsoleErrors;
        if (tracker.sendConsoleErrors === true) {
            var _onerror = window.onerror;
            //send console error messages to Fluentd
            window.onerror = function (msg, url, line, col, err){
                tracker.push({ 
                    category: 'BrowserJsException',
                    exception: {
                        message: msg,
                        url: url,
                        lineno: line,
                        colno: col,
                        stack: err ? err.stack : 'n/a',
                    }
                });

                if (_onerror && typeof _onerror === 'function') {
                    _onerror.apply(window, arguments);
                }
            };
        }
    }

    function setInputUrl(tracker,tag) {
        // if(tag === undefined){
        //     tracker.inputUrl = "http://165.227.185.207:80/json.file2";
        // }else{
        //     tracker.inputUrl = "http://165.227.185.207:80/"+tag
        // }
        tracker.inputUrl = "http://165.227.185.207:80/net/"; //Proxy NGINX
        console.log("tracker.inputUrl : "+tracker.inputUrl);
    }

    FluentdTracker.prototype = {
        push: function (data) {
            var type = typeof data;

            if (!data || !(type === 'object' || type === 'string')) {
                return;
            }

            var self = this;

            if (type === 'string') {
                console.log("type data string");
                data = {
                    'text': data
                };
            } else {
                console.log("other typeof");
                setInputUrl(self,data.tag);
                if (data.tag) {
                    setTag(self, data.tag);              
                    console.log("setting tag \""+data.tag+"\" to FluentdTracker");
                }
            }

            self.track(data);

        },
        track: function (data) {
            try {
                //creating an asynchronous XMLHttpRequest
                console.log("Creating an asynchronous XMLHttpRequest");
                console.log("inputUrl : "+this.inputUrl);
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open('POST', this.inputUrl, true); //true for asynchronous request
                xmlHttp.setRequestHeader('Content-Type', 'text/plain');
                xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "*"); //CORS
                xmlHttp.send(JSON.stringify(data));
                console.log("Sent an asynchronous XMLHttpRequest");

            } catch (ex) {
                if (window && window.console && typeof window.console.log === 'function') {
                    console.log("Failed to log to Fluentd because of this exception:\n" + ex);
                    console.log("Failed log data:", data);
                    $("#response").val(ex);
                }
            }
        },
    };

    var existing = window._FTracker;

    var tracker = new FluentdTracker();

    if (existing && existing.length) {
        var i = 0,
            eLength = existing.length;
        for (i = 0; i < eLength; i++) {
            tracker.push(existing[i]);
        }
    }

    window._FTracker = tracker; // default global tracker

	window.FluentdTracker = FluentdTracker; // if others want to instantiate more than one tracke

}); 