var dataurl_static = "";
var colCount = 0;
var colWidth = 0;
var margin = 2;
var blocks = [];
var home_onscroll_timer  = 0;

var content_webscroll = 0;

window.ondragstart = function() { return false; } 
//$('img').on('dragstart', function(event) { event.preventDefault(); });




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

	var o = document.getElementById("rooms_ct");
	var maxblen = 0;
	for(var j=0; j<blocks.length; j++)
	{
		if(blocks[j] > maxblen) maxblen = blocks[j];
	}
	o.style.height = (maxblen + 400) + "px"

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

	if(home_onscroll_timer)
	{
		clearTimeout(home_onscroll_timer);
		home_onscroll_timer = 0;
	}

	var scrollct = document.getElementById("conversation_fcontent");
	
	if(scrollct)
		home_onscroll(scrollct, function(){var conversation = new conversations(); conversation.expand_current("conversation_ct")});

	var conversation = new conversations();
	conversation.display(id, "conversation_ct");

	if(content_webscroll)
	{
		content_webscroll.refresh(); 
		content_webscroll.scrollTo(0,0,'0'); 
		content_webscroll.refresh(); 
	}
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
			$this.bind('touchEnd', touchend);
		}
		//event.preventDefault();
	}

	function mstouchmup(event)
	{
		$this.unbind('MSPointerMove', mstouchmove);
		$this.unbind('MSPointerUp', mstouchmup);
		event.preventDefault();
	}

	function touchend(event)
	{
		alert(1);
		event.preventDefault();
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
		  {
		  	$this.bind('MSPointerMove', mstouchmove);
		  }else{
			$this.bind('touchmove', touchmove);
		  }
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
			swiped = 1;
		  }
		  if (deltaX <= -50) {
			$this.trigger("swipeRight");
			swiped = 2;
		  }
		  if (deltaY >= 50) {
			$this.trigger("swipeUp");
			swiped = 3;
		  }
		  if (deltaY <= -50) {
			$this.trigger("swipeDown");
			swiped = 4;
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
	var o = document.getElementById("dataset1");
	if(o)
	{
		dataurl_static = o.getAttribute("data-staticurl");
	}

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

	swipe_set("#loginui");
	swipe_set("#loginnew");
	swipe_set("#sendmsg");
	swipe_set("#notifications");

	$("#page1").swipeEvents().bind("swipeRight",  function(){ panel_show("myPanel", "page1");});

	page_show("page1", 1);


	notifications_load();
	notifications_initialize_pool();


    
    load_webscroll();

}

function load_webscroll()
{
	var myScroll = new Array();

	$('.webscroll').each(function(){
        id = $(this).attr('id');
        var a = new iScroll(id, { onScrollStart: function() {this.refresh();}, onScrollEnd: function () {
					this.refresh();

					if(id === "conversation_fcontent")
					{
						if(document.getElementById(id).children[0].offsetHeight - 1000 < -this.y) 
						{
							setTimeout(function(){var conversation = new conversations();
							conversation.expand_current("conversation_ct");}, 0);
						}
					}
				}, onBeforeScrollStart: function (e) {
					var target = e.target;
					while (target.nodeType != 1) target = target.parentNode;
					if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
					e.preventDefault();
				}});
        
        content_webscroll = a;
        myScroll.push(a);

    });


}



function get_staticurl(fname)
{
	return dataurl_static + "client/" + fname;
}

var last_page_id = "splash";
var last_panel_id = 0;
var last_panel_timeoutid = 0;
var last_panel_show_timer = 0;
var last_page_id_h = "splash";

function page_show(id, side, mode)
{
	var md = 0;

	if(mode)
		md = mode;

	if(last_page_id === id) return;

	if(id === "previous")
	{
		if(last_page_id_h)
		{
			page_show(last_page_id_h, side, md);
			//last_page_id = last_page_id_h;
		}
		return 1;

	}else if(id === "previousx"){
	
		if(last_page_id_h)
		{
			page_show(last_page_id_h, side, 1);
			//last_page_id = last_page_id_h;
		}
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

	//document.getElementById(last_page_id).style.display = "none";
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
		$('#' + id).addClass('left');
	else
		$('#' + id).addClass('right');

	document.getElementById(id).style.display = "inline";
	last_page_id = id;


	if(md != 1)
	{
		var panelonload = document.getElementById(id).getAttribute('data-onload');
		if(panelonload)
		{
			if(window[panelonload]) window[panelonload]();
		}

		var paction = document.getElementById(id).getAttribute('data-paction');
		if(paction)
		{
			if(window[paction]) window[paction]();
		}
	}
	
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


function image_center_block(obj)
{
	var parentWidth = obj.parentNode.offsetWidth;
	var parentHeight = obj.parentNode.offsetHeight;

	var imageWidth = obj.naturalWidth;
	var imageHeight = obj.naturalHeight;

	var diff = imageWidth / parentWidth;

	if ((imageHeight / diff) < parentHeight)
	{
		obj.style.width = 'auto';
		obj.style.height = parentHeight + "px";
		imageWidth = imageWidth / (imageHeight / parentHeight);
		imageHeight = parentHeight;
	}
	else {
		obj.style.width = parentWidth + "px";
		obj.style.height = 'auto';
		imageWidth = parentWidth;
		imageHeight = imageHeight / diff;
	}

	var leftOffset = (imageWidth - parentWidth) / -2;
	var topOffset = (imageHeight - parentHeight) / -2;

	obj.style.marginLeft = leftOffset + "px";
	obj.style.marginTop = topOffset + 'px';
}

function image_center_fillsq(obj)
{
	var parentWidth = obj.parentNode.offsetWidth;
	var parentHeight = obj.parentNode.offsetHeight;

	var imageWidth = obj.naturalWidth;
	var imageHeight = obj.naturalHeight;

	if(imageWidth > imageHeight)
	{
		obj.style.width = 'auto';
		obj.style.height = parentHeight + "px";
		obj.style.marginLeft = -(((parentHeight / imageHeight * imageWidth) / 2) - (parentWidth / 2)) + "px";
	}else{
		obj.style.width = parentWidth + "px";
		obj.style.height = 'auto';
		obj.style.marginTop = -(((parentWidth / imageWidth * imageHeight) / 2) - (parentHeight / 2)) + "px";
	}

}


function home_onscroll(ct, callf)
{
    var p = ct.scrollTop / (ct.scrollHeight - ct.clientHeight); 

	if(p > 0.9)
	{
		callf();
	}
	
	home_onscroll_timer = setTimeout(function(){home_onscroll(ct, callf);}, 1000);
}


function notice_close(obj)
{
	obj.style.display = "none";
}

function notice(txt)
{
	var o = document.getElementById('alertbox');
	o.innerHTML = "<h2>" + txt + "</h2>";
	o.style.display = "";
}









