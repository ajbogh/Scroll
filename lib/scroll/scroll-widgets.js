function ScrollWidgets(scroll, loadWidgets){
	Scroll.prototype.widgets = {};
	this.scroll = scroll;
	var self = this;

	$(document).ready(function(){
		$("head").append('<link rel="stylesheet" href="'+scroll.path+'/scroll/css/scroll.widgets.css" />');
		$("body").append('<div id="scroll-sidebar" class="closed">'+
				'<div id="scroll-sidebar-pullout-button" class="closed"></div>'+
				'<div id="scroll-sidebar-content">'+
					'<div id="scroll-sidebar-title"><h1>'+scroll.lang.widgets+'</h1></div>'+
					'<ul id="scroll-sidebar-panels"></ul>'+
				'</div>'+
			'</div>'
		);

		// TODO: make this dynamic
		$("#scroll-sidebar-pullout-button").on("click", function(){
			if($(this).hasClass("closed")){
				$(this).removeClass("closed");
				$(this).parent().removeClass("closed");
			}else{
				$(this).addClass("closed");
				$(this).parent().addClass("closed");
			}
		});

		if(loadWidgets){
			for(var i=0; i<loadWidgets.length; i++){
				$("head").append('<script type="text/javascript" src="'+scroll.path+"/scroll/scroll-widgets/scroll."+loadWidgets[i]+".js"+'"></script>');
				
				function checkInsert(){
					if($("#scroll-sidebar-panels>.scroll-panel").length == i){
						self.addWidget(scroll.widgets[loadWidgets[i].replace(/-/g,'')]);
					}
				}

				var inserted = checkInsert();
				if(!inserted){
					setTimeout(function(){
						checkInsert();
					}, 250); //other files must be loading, wait for them
				}
			}
		}
	});

	ScrollWidgets.prototype.addWidget = function(widget){
		var $newPanel = $("<li>",{
			"id": "scroll-width-"+widget.name,
			"class": "scroll-sidebar-panel"
		});
		$newPanel.append('<h2>'+this.scroll.lang["widgets-"+widget.name]+'</h2><div class="scroll-sidebar-panel-image"><img src="'+widget.image+'" width="100%" /></div>')
		$newPanel.data("html", widget.html);

		$("#scroll-sidebar-panels").append($newPanel);
	}
}