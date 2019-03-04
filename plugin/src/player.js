var ElasticPlayer = function sequenceIIFE() {
    var mouseElement;
    var useCache = true;
    var dtds;
    var sessionStartTime = 0;
    return {
        init: function () {
            dtds = new Dtds(document, {
                createElement: tagName => {
                    if (tagName == 'SCRIPT') {
                        var node = document.createElement('noscript');
                        node.style.display = 'none';
                        return node;
                    }
                }
            });
        },
        handleMouseMove: function ({pageX, pageY}) {
            //mouseElement.style.top = pageX + 'px';
            //mouseElement.style.left = pageY + 'px';

            mouseElement.style.transform = 'translate(' + pageX + 'px,' + pageY + 'px)';
        },
        handleMouseClick: function ({pageX, pageY}) {
            Utils.simulateClickOn(document.body, {clientX: pageX+'px', clientY: pageY+'px'});
        },
        handleScroll: function ({pageXOffset, pageYOffset}) {
            window.scrollTo(pageXOffset, pageYOffset);
        },
        handleInputChange: function ({xpath, value}) {
            var element = this.getElementByXpath(xpath);
            element.value = value;
        },
        handleDomInit({rootId, children}) {
            Utils.resetDom();
            dtds.initialize(rootId, children);
            Utils.insertCSS();
            if (document.body && !mouseElement) {
                mouseElement = Utils.createCursorElementOn(document.body);
            }
        },
        getElementByXpath: function (path) {
            return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        },
        handleDomChange({removed, addedOrMoved, attributes, text}) {
            if (document.body && !mouseElement) {
                mouseElement = Utils.createCursorElementOn(document.body);
            }
            dtds.applyChanged(removed, addedOrMoved, attributes, text)
        },
        loadRecordData: function (eventName, eventData) {
            if (useCache) {
                var sessionData = JSON.parse(localStorage.getItem('sessionData'));
                console.log(sessionData);
                sessionStartTime = sessionData.start;
                this.playEvents(sessionData.events);
            } else {
                var oReq = new XMLHttpRequest();

                oReq.onload = function () {
                    console.log('Inside the onload event');
                };
                oReq.onreadystatechange = function () {
                    if (oReq.readyState === 4 && oReq.status === 200) {
                        console.log('responseText:' + oReq.responseText);
                        try {
                            var data = JSON.parse(oReq.responseText);
                        } catch (err) {
                            console.log(err.message + " in " + oReq.responseText);
                        }
                        //callback(data);
                    }
                };
                oReq.open('GET', 'http://localhost:3000/get_events?site=TestSite&session=1', true);
                oReq.send();
            }


        },
        playEvents: function (eventsToPlay) {
            eventsToPlay.forEach((event) => {
                setTimeout(() => {

                    var eventData = JSON.parse(event.data.data);
                    var eventName = event.data.name;
                    console.log('playing:' + eventName + ', with data:', eventData);
                    if (eventName === 'MOUSE_MOVE') {
                        ePlayer.handleMouseMove(eventData)
                    } else if (eventName === 'SCROLL') {
                        ePlayer.handleScroll(eventData)
                    } else if (eventName === 'CLICK') {
                        ePlayer.handleMouseClick(eventData)
                    } else if (eventName === 'DOM_INIT') {
                        ePlayer.handleDomInit(eventData)
                    } else if (eventName === 'DOM_CHANGE') {
                        ePlayer.handleDomChange(eventData)
                    } else if (eventName === 'INPUT_CHANGE') {
                        ePlayer.handleInputChange(eventData)
                    }

                }, event.data.ts - sessionStartTime);
            })
        }
    };
};

var ePlayer = new ElasticPlayer();
ePlayer.init();

