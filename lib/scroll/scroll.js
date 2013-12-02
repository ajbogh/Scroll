function Scroll(options){
	var self = this;
	this.path = "";
	this.locale = "en-US";
	if(options && options.elemId){
		this.statusElemId = options.statusElemId ? options.statusElemId : null;
		this.elemId = options.elemId ? options.elemId : null;
		this.id = options.id ? options.id : null;
		this.locale = options.locale ? options.locale : this.locale;
		this.saveFunction = options.saveFunction ? options.saveFunction : null;
		this.loadFunction = options.loadFunction ? options.loadFunction : null;
		this.toggleTemplate = options.toggleTemplate ? options.toggleTemplate : null;
	}else{
		throw new Error("Scroll must have an 'elem' property in the options parameter for the constructor.");
	}

	$(document).ready(function(){
		var keysDown = [];

		if(self.elemId){
			self.elem = $("#"+self.elemId);
		}
		if(self.statusElemId){
			self.statusElem = $("#"+self.statusElemId);
		}

		$(self.elem).on('keydown', function(e){
			keysDown[e.keyCode] = true;
			if(e.keyCode == 9) { //tab
					e.preventDefault();
				if(keysDown[16] === true){ //shift is 16
					//TODO: make shift(16)-tab(9) delete any previous tab in the line.
				}else{
					self.insertTextAtCursor('\t');	
				}
			}
		});

		$(self.elem).on('keyup', function(e){
			keysDown[e.keyCode] = false;
		});

		$(self.elem).on('blur', function(e){
			self.save($(self.elem), $(self.statusElem));
		});

		self.load();

		setInterval(function(){ self.save($(self.elem), $(self.statusElem)); }, 5000);
	});

	CKEDITOR.plugins.registered['save'] = {
		init : function( editor ){
			var command = editor.addCommand( 'save', {
				modes : { wysiwyg:1, source:1 },
				exec : function( editor ) {
					self.save($(self.elem), $(self.statusElem));
				}
			});
			editor.ui.addButton( 'Save',{label : 'Save Document',command : 'save'});
		}
	}

	//get the path
	this.getPath();
	
	//get the language file
	this.getLanguageFile();
}

Scroll.prototype.getLanguageFile = function(){
	var self = this;
	$.ajax({
		url: this.path+"/scroll/lang/"+this.locale+".json",
		dataType: "json",
		async: false,
		success: function(data){
			self.lang = data;
		}
	});
}

Scroll.prototype.getPath = function(){
	if(!this.id){
		$scroll = $("#scroll");
		if($scroll.length() == 0){
			this.id = "scroll";
			$('script[src*="/scroll.js"]').attr("id") = "scroll";
		}else{
			this.id = $scroll.id;
		}
	}
	this.path = $("#"+this.id).attr("src").replace(/(\/scroll\/scroll.js)$/, '');
};

Scroll.prototype.insertTextAtCursor = function(text) { 
	var sel, range, html; 
	sel = window.getSelection();
	range = sel.getRangeAt(0); 
	range.deleteContents(); 
	var textNode = document.createTextNode(text);
	range.insertNode(textNode);
	range.setStartAfter(textNode);
	sel.removeAllRanges();
	sel.addRange(range);
};

Scroll.prototype.save = function($elem, $statusElem){
	var self = this;

	if(this.saveTimeout){
		clearTimeout(this.saveTimeout);
	}
	if($statusElem){
		$statusElem.html("Saving...");
	}

	var content, contentId;
	contentId = $elem.attr("id");
	content = $elem.html();

	if(this.saveFunction){
		var saved = this.saveFunction(content, contentId);
		if(saved.then){
			saved.then(function(){
				if($statusElem){
					$statusElem.html("Save successful");

					self.saveTimeout = setTimeout(function(){
						$statusElem.empty();				
					}, 3000)
				}
			});
		}
	}else{
		if(!localStorage.scroll){
			localStorage.scroll = JSON.stringify({});
		}
		var newScroll = JSON.parse(localStorage.scroll);
		newScroll[contentId] = content;
		localStorage.scroll = JSON.stringify(newScroll);
		if($statusElem){
			$statusElem.html("Save successful");
			self.saveTimeout = setTimeout(function(){
				$statusElem.empty();				
			}, 3000)
		}
	}
};

Scroll.prototype.load = function(){
	var self = this;
	CKEDITOR.on("instanceReady", function(event)
	{
		if(self.loadFunction){
			self.loadFunction(event.editor);
		}else{
			if(localStorage.scroll){
				var scrollContent = JSON.parse(localStorage.scroll);
				for(var i in scrollContent){
					self.loadHtml(scrollContent[i], i);
				}
			}
		}
	});
};

Scroll.prototype.loadHtml = function(html, elemId, extraData, editor){
	if(!elemId){
		elemId = this.elemId;
	}
	var elem = new CKEDITOR.dom.element(document.getElementById(elemId)).setHtml(html);
	if(extraData){
		document.getElementById(elemId).dataset.extra = extraData;
	}
};

Scroll.prototype.setToggleTemplate = function(tt){
	this.toggleTemplate = tt;
};