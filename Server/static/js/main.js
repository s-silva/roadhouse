function $(id)
{
    return document.getElementById(id);
}

function form_getjson(o)
{
	var json = {}
	
	if(!o) return json;
	if(!o.elements) return json;
	
    for (var i = 0; i < o.elements.length; i++)
	{
		if(o.elements[i])
		{
			if(o.elements[i].name != "")
			{
				json[o.elements[i].name] = o.elements[i].value;
			}
		}
    }
	
	return json;
}

/* main */

function main_init()
{
	sockets_init();
}


/* sockets */

function sockets_init()
{
	var msgform = $("messageform");
	
	if(!msgform) return 0;

	msgform.onsubmit = function() {
			sockets_newformmsg(msgform);
			return false;
		};
	
    msgform.onkeydown = function(e) {
			if (e.keyCode == 13)
			{
				sockets_newformmsg(msgform);
				return false;
			}
		};
		
    updater.start();
}

function sockets_newformmsg(form)
{
    var message = form_getjson(form);
    updater.socket.send(JSON.stringify(message));
}

var updater = {
    socket: null,

    start: function()
	{
        var url = "ws://" + location.host + "/socketapi";
        if ("WebSocket" in window)
		{
			updater.socket = new WebSocket(url);
        }else{
            updater.socket = new MozWebSocket(url);
        }
		updater.socket.onmessage = function(event) {
			updater.showMessage(JSON.parse(event.data));
		}
    },

    showMessage: function(message)
	{
		$('testinbox').innerHTML = message.html + " " + $('testinbox').innerHTML;
        /* var existing = $("#m" + message.id);
        if (existing.length > 0) return;
        var node = $(message.html);
        node.hide();
        $("#inbox").append(node);
        node.slideDown();*/
    }
};
