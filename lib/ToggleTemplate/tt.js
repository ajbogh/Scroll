function ToggleTemplate(){
	this.closingSeparator = "}}";
	this.openingSeparator = "{{";
	this.keySeparator = ".";
	this.renderedOutput = "";
	this.rendered = false;
	this.template = "";
	this.data = {};

	return this;
}

/**
 * render renders a template using some data.
 * @return {string} The rendered output.
 */
ToggleTemplate.prototype.render = function(template, data) {
	if(template){
		this.setTemplate(template);
	}
	if(data){
		this.setData(data);
	}
	
	//process the template
	this.renderedOutput = this.preProcessTemplate();
	this.processDataUsingRenderedOutput();
	this.rendered = true;

	return this.renderedOutput;
};

/**
 * Sets the original template.
 * @param {string} template
 */
ToggleTemplate.prototype.setTemplate = function(template) {
	this.template = template;
};

/**
 * Sets the data to use for the template.
 * @param {string} template
 */
ToggleTemplate.prototype.setData = function(data) {
	this.data = data;
};

/**
 * Toggles the template to display the original replacement tokens.
 */
ToggleTemplate.prototype.toggleTemplate = function(inputHtml, doNotUpdateRenderedOutput) {
	inputHtml = inputHtml || this.renderedOutput;

	var $ro = $("<div>"+inputHtml+"</div>");
	$ro.find(".tt-replacement").each(function(){
		var $this = $(this);
		var html = $this.html();
		var orig = unescape($this.data('ttorig'));
		$this[0].dataset.ttorig = escape(html);
		$this.html(orig);
	});

	if(!doNotUpdateRenderedOutput){
		//find all spans with a data-ttOrig and replace the text with the orig
		this.renderedOutput = $ro.html();
		if(!this.rendered){
			this.processDataUsingRenderedOutput();
		}
		$ro.html(this.renderedOutput);
		this.rendered = !this.rendered;
	}
	return $ro.html();
};

/**
 * Processes the template based on the input data.
 */
ToggleTemplate.prototype.preProcessTemplate = function(){
	var str = this.template;

	//var indices = this.getIndices();
	//var closingIndices = this.getClosingIndices(indices);
	var currentIndex = -1;
	var closingIndex = -1;
	var currentToken;
	var replacement = null;
	var lastIndex = -1;

	while(currentIndex !== null){
		replacement = null;
		currentIndex = this.findNextIndex(str);
		if(currentIndex === lastIndex || currentIndex === null){
			break; //we're done
		}else{
			lastIndex = currentIndex;
		}

		if(currentIndex !== null){
			closingIndex = str.indexOf(this.closingSeparator, currentIndex);
		}
		currentToken = str.substring(currentIndex+this.openingSeparator.length, closingIndex);
		
		replacement = '<span class="tt-replacement" data-ttorig="'+escape(this.openingSeparator+currentToken.replace('"','\"')+this.closingSeparator)+'"></span>';
		str = str.substring(0, currentIndex) + 
				replacement+
				str.substring(closingIndex+this.closingSeparator.length);
	}

	return str;
};

ToggleTemplate.prototype.processDataUsingRenderedOutput = function(){
	var output = this.renderedOutput;
	var $output = $('<div>'+output+'</div>');
	var self = this;
	$output.find('.tt-replacement').each(function(){
		//use currentToken to get the text from the data object
		var currentToken = unescape($(this)[0].dataset.ttorig);
		currentToken = currentToken.replace(/^({{)/, "").replace(/(}})$/, "");
		var keys = currentToken.split(self.keySeparator);
		var replacement = "";
		
		for (var j = 0; j < keys.length; j++) {
			try{
				replacement = replacement ? replacement[keys[j]] : self.data[keys[j]];
			}catch(e){}
		}

		$(this).html(replacement);
	});
	this.renderedOutput = $output.html();
}

/**
 * [findNextIndex description]
 * @param  {string} str - A string to search.
 * @return {int|null} index of the string or null.
 */
ToggleTemplate.prototype.findNextIndex = function(str){
	var regex = new RegExp(this.openingSeparator+"[^"+this.openingSeparator+this.closingSeparator+"]+"+this.closingSeparator,"g");
	var result = regex.exec(str);
	if(result === null){
		return result;
	}else{
		return result.index;
	}
};