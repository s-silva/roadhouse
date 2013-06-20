var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
        //document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};


$('img').on('dragstart', function(event) { event.preventDefault(); });
/*
(function($) {
    var methods = {
        init : function(options) {
            var settings = {
                callback: function() {}
            };
        
            if ( options ) {
                $.extend( settings, options );
                }

            $(":jqmData(role='page')").each(function() {

                if($(this).attr("data-subpage") !== "conversation")
                {

                    $(this).bind("swiperight", function() {
                        var nextPage = parseInt($(this).attr("id").split("page")[1]) - 1;
                            if (nextPage === 0) 
                            {
                                $("#myPanel").panel("open", {display: 'push', position: 'left', animate: true});
                            }else{
                                $.mobile.changePage("#page"+nextPage, {
                                        transition: "slide",
                                        reverse: true,
                                        changeHash: false
                                    });
                            }
                        });                        

                    $(this).bind("swipeleft", function() {
                        var nextPage = parseInt($(this).attr("id").split("page")[1]) +1;
                        if (nextPage == 5) 
                            nextPage = 1;
                        
                        
                        $.mobile.changePage("#page"+nextPage, {
                            transition: "slide",
                            reverse: false,
                            changeHash: false
                        });
                        
                    });
                }
            })
        }
        }

    $.fn.initApp = function(method) {
        if ( methods[method] ) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } 
        else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } 
        else {
            $.error( 'Method ' + method + ' does not exist' );
        }
    }
    })(jQuery);

$(document).ready(function(){
    $().initApp();
    roomset_init();
    //GetMap();
});

*/

var colCount = 0;
var colWidth = 0;
var margin = 0;
var blocks = [];

function roomset_init()
{
    var i = 0;

    colCount = 2;
    if($(window).width() > $(window).height()) colCount = 3;
    
    colWidth = $(window).width() / colCount;
    blocks = [];

    
    for(var i=0;i<colCount;i++){
        blocks.push(margin);
    }
    
    i = 0;

    var tiles = [];
    var last_i = 0;

    $('#rooms_ct .room_tile').each(function(i, obj)
    {
        obj.setAttribute('data-type', 's');
        tiles.push(obj);
        last_i = tiles.length;

        if(last_i == 4)
        {
            if(Math.ceil(Math.random() * 2) == 1)
            {
                tiles[0].setAttribute('data-type', 't');
                tiles[1].setAttribute('data-type', 's');
                tiles[2].setAttribute('data-type', 's');
            }else{
                tiles[0].setAttribute('data-type', 's');
                tiles[1].setAttribute('data-type', 't');
                tiles[2].setAttribute('data-type', 's');
            }

            if(colCount == 2)
                tiles[3].setAttribute('data-type', 'w');

            tiles = [];
        }
    });

    if(colCount == 2)
    {
        if(last_i == 1)
        {
            tiles[0].setAttribute('data-type', 'w');
        }else if(last_i == 3){
            tiles[0].setAttribute('data-type', 's');
            tiles[1].setAttribute('data-type', 't');
            tiles[2].setAttribute('data-type', 's');
        }
    }

    $('#rooms_ct .room_tile').each(function(i, obj)
    {
        var o = obj;
        var minset = array_min(blocks);

        var min = minset.v;
        var index = minset.i;
        
        var leftPos = margin + (index * (colWidth + margin));
        
        o.style.left = leftPos + 'px';
        o.style.top = (min - margin) + 'px';

        var dt = obj.getAttribute('data-type');

        if(dt === 't')
        {
            var h = (colWidth * 2);
            o.style.width = colWidth + 'px';
            o.style.height = h + 'px';
            
            blocks[index] = min + h + margin;

        }else if(dt === 'w'){
            o.style.left = margin + 'px';
            o.style.width = (colWidth * colCount) + 'px';
            o.style.height = (colWidth * 1.2) + 'px';
            
            for(var i=0;i<colCount;i++){
                blocks[i] = min + (colWidth * 1.2) + margin;
            }

        }else{

            o.style.width = colWidth + 'px';
            o.style.height = colWidth + 'px';
            
            blocks[index] = min + colWidth + margin;
        }

        var img = $(o).find("img");
        if(img.length >= 1)
        {
            img_center(img.first(), o);
        }

        i++;
    });

}

function array_min(a)
{
    var l = a.length, i, m = 0, mi = 0;
    
    var r={'v':0,'i':0};
    
    if(!l) return r;
    
    m = a[0];
    
    for(i=1; i<l; i++)
    {
        if(a[i] < m)
        {
            m = a[i];
            mi = i;
        }
    }
    
    r.v = m;
    r.i = mi;
    return r;
};

$(window).resize(function() {
    roomset_init();
});


function img_center(o, p)
{
    var w = $(p).width();
    var h = $(p).height();

    if(w >= h)
    {
        o.css('width', 'auto');
        o.css('height', '100%');
    }

}


function conversation_display(id)
{
    page_show("conv1", 0);

    if(this.swipe_setup !== 1)
    {
        swipe_set("#conv1");               
        swipe_set("#conv2");
    }

    this.swipe_setup = 1;

    var conversation = new conversations();
    conversation.display(id, "conversation_ct");

}


(function($) { 
  $.fn.swipeEvents = function() {
    return this.each(function() {
      
      var startX,
          startY,
          $this = $(this);

      if(window.navigator.msPointerEnabled)
         $this.bind('MSPointerDown', mstouchstart);
      else
         $this.bind('touchstart', touchstart);

    function mstouchstart(event)
    {
        var pointerList = event.changedTouches ? event.changedTouches : [event];
        if(!pointerList.length) return 0;

        var pt = pointerList[0];
        
        startX = pt.pageX ? pt.pageX : pt.originalEvent.pageX;
        startY = pt.pageY ? pt.pageY : pt.originalEvent.pageY;

        if(window.navigator.msPointerEnabled)
        {
            $this.bind('MSPointerMove', mstouchmove);
            $this.bind('MSPointerUp', mstouchmup);
        }else{
            $this.bind('touchmove', touchmove);
        }
        //event.preventDefault();
    }

    function mstouchmup(event)
    {
        $this.unbind('MSPointerMove', mstouchmove);
        $this.unbind('MSPointerUp', mstouchmup);
    }

    function mstouchmove(event)
    {
        var pointerList = event.changedTouches ? event.changedTouches : [event];
        if(!pointerList.length) return 0;

        var pt = pointerList[0];
        
        
        var deltaX = startX - (pt.pageX ? pt.pageX : pt.originalEvent.pageX);
        var deltaY = startY - (pt.pageY ? pt.pageY : pt.originalEvent.pageY);

        if (deltaX >= 50) {
            $this.trigger("swipeLeft");
        }if (deltaX <= -50) {
            $this.trigger("swipeRight");
        }if (deltaY >= 50) {
            $this.trigger("swipeUp");
        }if (deltaY <= -50) {
            $this.trigger("swipeDown");
        }

        if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50)
        {

            if(window.navigator.msPointerEnabled)
                $this.unbind('MSPointerMove', mstouchmove);
            else
                $this.unbind('touchmove', touchmove);
        }
        event.preventDefault();
    }



      function touchstart(event) {
        var touches = event.originalEvent.touches;
        if (touches && touches.length) {
          startX = touches[0].pageX;
          startY = touches[0].pageY;
          if(window.navigator.msPointerEnabled)
            $this.bind('MSPointerMove', mstouchmove);
          else
            $this.bind('touchmove', touchmove);
        }
        event.preventDefault();
      }

      function touchmove(event) {
        var touches = event.originalEvent.touches;
        if (touches && touches.length) {
          var deltaX = startX - touches[0].pageX;
          var deltaY = startY - touches[0].pageY;
          
          if (deltaX >= 50) {
            $this.trigger("swipeLeft");
          }
          if (deltaX <= -50) {
            $this.trigger("swipeRight");
          }
          if (deltaY >= 50) {
            $this.trigger("swipeUp");
          }
          if (deltaY <= -50) {
            $this.trigger("swipeDown");
          }
          if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
            
            if(window.navigator.msPointerEnabled)
                $this.unbind('MSPointerMove', mstouchmove);
            else
                $this.unbind('touchmove', touchmove);
          }
        }
        event.preventDefault();
      }
      
    });
  };
})(jQuery); 


function roadhouse_init()
{
    settings_load();

    roomset_init();
    swipe_set("#page1");
    swipe_set("#page2");
    swipe_set("#page3");
    swipe_set("#page4");

    swipe_set("#settings1");
    swipe_set("#settings2");
    swipe_set("#settings3");
    swipe_set("#settings4");
    swipe_set("#settings5");

    swipe_set("#camera1");

    swipe_set("#newpost");
    swipe_set("#newroom");

    swipe_set("#friends");
    swipe_set("#profile");

    swipe_set("#notifications");

    $("#page1").swipeEvents().bind("swipeRight",  function(){ panel_show("myPanel", "page1");});

    setTimeout(function() { page_show("page1", 1); }, 1000);


    notifications_initialize_pool();
}

var last_page_id = "splash";
var last_panel_id = 0;
var last_panel_timeoutid = 0;
var last_panel_show_timer = 0;
var last_page_id_h = "splash";

function page_show(id, side)
{
    if(last_page_id === id) return;

    if(id === "previous")
    {
        if(last_page_id_h)
                page_show(last_page_id_h, side);
        return 1;
    }else{
        if(last_page_id)
            last_page_id_h = last_page_id;
    }

    if(last_panel_id !== 0)
    {
        panel_close(last_panel_id);
        return 1;
    }


    $('#' + last_page_id).removeClass('left');
    $('#' + last_page_id).removeClass('right');

    $('#' + last_page_id).addClass('close');

    
    if(last_panel_timeoutid !== 0)
    {
        document.getElementById(last_panel_timeoutid).style.display = "none";
        window.clearTimeout(last_panel_show_timer);
        last_panel_timeoutid = 0;
    }

    last_panel_timeoutid = last_page_id;

    setTimeout(function() {
            if(last_panel_timeoutid)
                document.getElementById(last_panel_timeoutid).style.display = "none";
            last_panel_timeoutid = 0;
        }, 300);

    if(side == 0)
        $('#' + id).addClass('left')
    else
        $('#' + id).addClass('right')

    document.getElementById(id).style.display = "inline";

    var panelonload = document.getElementById(id).getAttribute('data-onload');
    if(panelonload)
    {
        if(window[panelonload]) window[panelonload]();
    }

    var paction = document.getElementById(id).getAttribute('data-paction');

    if(paction) window[paction]();

    last_page_id = id;
}

function page_show_from_panel(id)
{
    if(last_panel_id !== 0)
    {
        panel_close(last_panel_id);
    }
    page_show(id, 0);
}

function panel_show(id, page)
{
    last_panel_id = id;
    $('#' + id).addClass('show');
    document.getElementById(id).style.display = "inline";
}

function panel_close(id)
{
    $('#' + id).removeClass('show');
    document.getElementById(id).style.display = "none";
    last_panel_id = 0;
}

function page_show_dialog(id)
{
    page_show(id, 0);
}



function swipe_set(id)
{
    if($(id).attr('data-sr') !== "0")
        $(id).swipeEvents().bind("swipeLeft",  function(){ page_show($(id).attr('data-sr'), 1 );});
    if($(id).attr('data-sl') !== "0")
        $(id).swipeEvents().bind("swipeRight",  function(){ page_show($(id).attr('data-sl'), 0 );});
}

function get_window_size()
{
    return {w: $(window).width(), h: $(window).height()};
}

var show_dialog_lastid = 0;

function show_dialog(id, focuselementid)
{
    var o = document.getElementById(id);
    if(!o) return 0;

    show_dialog_lastid = id;

    o.style.display = "";
    o.style.zIndex = 100021;

    if(focuselementid)
    {
        var felemento = document.getElementById(focuselementid);
        if(felemento) felemento.focus();

    }

    document.getElementById("dialog-overlay").style.display = "";
}

function close_dialog(id)
{
    if(!id) id = show_dialog_lastid;

    var o = document.getElementById(id);
    if(o) o.style.display = "none";

    document.getElementById("dialog-overlay").style.display = "none";
}