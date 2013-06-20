var notification_msgs = [];

function notifications_initialize()
{
	
}


function notifications_display()
{
	page_show("notifications", 0);
	notification_msgs = [];
	var o = document.getElementById("notification-button");
	if(o) o.style.display = "none";
}

function notification_format(data)
{
	return "<div class='notification-item'><div class='notification-dp'><img src='img/test/dp.jpg'/></div>" + 
				"<div class='notification-text'>" + data + "</div><div style='clear: both;'></div></div>";
}


function notification_format_simple(data)
{
	return data;
}

function notifications_add(data)
{
	/*
		types:

		message from
		new post (subscribed room)
		new note
		upvote

	*/ 		

	notification_msgs.push(data);


	var o = document.getElementById("notification-button");
	if(o)
	{
		o.innerHTML = notification_msgs.length;
		o.style.display = "";
	}

	o = document.getElementById("notification-list");
	if(o)
	{
		for(var i=0; i<notification_msgs.length; i++)
		{
			o.innerHTML += notification_format(notification_msgs[i]);//insertBefore("<div>" + notification_msgs[i] + "</div>", o.firstChild);
		}
	}

	if(notification_msgs.length > 0)
		document.getElementById("notification-lastshort-l1").innerHTML = notification_format_simple(notification_msgs[notification_msgs.length - 1]);

	if(notification_msgs.length > 1)
		document.getElementById("notification-lastshort-l2").innerHTML = notification_format_simple(notification_msgs[notification_msgs.length - 2]); 

	if(notification_msgs.length > 0)
		document.getElementById("notification-lastshort-p1").innerHTML = notification_format_simple(notification_msgs[notification_msgs.length - 1]);

	if(notification_msgs.length > 1)
		document.getElementById("notification-lastshort-p2").innerHTML = notification_format_simple(notification_msgs[notification_msgs.length - 2]);

	if(notification_msgs.length === 1)
	{
		document.getElementById("notification-counter-l").innerHTML = "1 Notification";
		document.getElementById("notification-counter-p").innerHTML = "1 Notification";
	}else{
		document.getElementById("notification-counter-l").innerHTML = notification_msgs.length + " Notifications";
		document.getElementById("notification-counter-p").innerHTML = notification_msgs.length + " Notifications";
	}
}


function notifications_initialize_pool()
{
	socket_listener.start();
}


var socket_listener = {
    socket: null,

    start: function()
    {
        var url = socket_url;
        if ("WebSocket" in window)
        {
			socket_listener.socket = new WebSocket(url);
        } else {
            socket_listener.socket = new MozWebSocket(url);
        }
		socket_listener.socket.onmessage = function(event)
		{
			notifications_add(event.data);
			//socket_listener.showMessage()JSON.parse(event.data));
		}
    },

    //showMessage: function(message) {
    //    var existing = $("#m" + message.id);
    //    if (existing.length > 0) return;
    //    var node = $(message.html);
    //    node.hide();
    //    $("#inbox").append(node);
    //    node.slideDown();
    //}
};