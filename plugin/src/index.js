import DomTreeSerializer from './DomTreeSerializer';

function getPathTo(element) {
    if (element.id !== '')
        return 'id("' + element.id + '")';
    if (element === document.body)
        return element.tagName;

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling === element)
            return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
            ix++;
    }
}

var ElasticRecord = function sequenceIIFE() {
    var timeoutForMouseMove;
    var timeoutForScroll;
    var useCache = true;
    var dts;
    var reset = true;

    document.addEventListener('mousemove', ({pageX, pageY}) => {
        if (!timeoutForMouseMove) {
            timeoutForMouseMove = setTimeout(function () {
                clearTimeout(timeoutForMouseMove);
                timeoutForMouseMove = null;
            }, 300);
            eRecord.sendEvent('MOUSE_MOVE', {pageX, pageY})
        }
    });

    document.addEventListener('mousemove', ({pageX, pageY}) => {
        if (!timeoutForMouseMove) {
            timeoutForMouseMove = setTimeout(function () {
                clearTimeout(timeoutForMouseMove);
                timeoutForMouseMove = null;
            }, 300);
            eRecord.sendEvent('MOUSE_MOVE', {pageX, pageY})
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.target.localName === 'input') {
            var xpath = getPathTo(event.target);
            eRecord.sendEvent('INPUT_CHANGE', {xpath, value: event.target.value});
        }
    });

    document.addEventListener('scroll', ({pageX, pageY}) => {
        if (!timeoutForScroll) {
            timeoutForScroll = setTimeout(function () {
                clearTimeout(timeoutForScroll);
                timeoutForScroll = null;
            }, 300);
            eRecord.sendEvent('SCROLL', {pageX, pageY})
        }
    });

    document.addEventListener('click', ({pageX, pageY}) => {
        eRecord.sendEvent('CLICK', {pageX, pageY})
    });

    return {
        init: function () {
            if (reset) {
                localStorage.setItem('sessionData', JSON.stringify({
                    events: [],
                    start: Date.now()
                }))
            }
            dts = new DomTreeSerializer(document, {
                initialize: (rootId, children) => {
                    this.sendEvent('DOM_INIT', {rootId, children})
                },
                applyChanged: (removed, addedOrMoved, attributes, text) => {
                    this.sendEvent('DOM_CHANGE', {removed, addedOrMoved, attributes, text})
                }
            });
        },
        sendEvent: function (eventName, eventData) {
            console.log('recorded event name: ' + eventName + ', details:', eventData);
            var eventDataToSend = JSON.stringify(eventData);

            if (useCache) {
                var localStorageObject = {
                    events: [],
                    start: Date.now()
                };

                if (localStorage.getItem('sessionData')) {
                    var tmpObj = JSON.parse(localStorage.getItem('sessionData'));
                    if (tmpObj.events && Array.isArray(tmpObj.events)) {
                        localStorageObject = tmpObj;
                    }
                }

                localStorageObject.events.push({
                    type: 'event',
                    data: {
                        name: eventName,
                        data: eventDataToSend,
                        ts: Date.now()
                    }
                });
                localStorage.setItem('sessionData', JSON.stringify(localStorageObject));
            } else {
                var oReq = new XMLHttpRequest();
                oReq.onload = function () {
                    console.log('Inside the onload event');
                };
                oReq.onreadystatechange = function () {
                    console.log('onreadystatechange');
                };
                oReq.open('GET', 'http://localhost:3000/event?name=' + eventName + '&data=' + eventDataToSend + '&ts=' + (Date.now()), true);
                oReq.send();
            }

        },
    };
};

var eRecord = new ElasticRecord();
eRecord.init();


