function Scroll(){
	this.scrollContainer = $("#scroll-container");
	if(this.scrollContainer.prop("contenteditable") !== true){
		this.scrollContainer.prop("contenteditable", true);
	}
}

Scroll.prototype.insertSection = function(noInsert){
	var $section = $("section");
	if(!noInsert){
		this.insertNodeAtCaret($section[0]);		
	}
	return $section;
}

Scroll.prototype.insertPageBreak = function(){
	var $section = this.insertSection(true);
	$section.addClass("scroll-pagebreak");
	this.insertNodeAtCaret($section[0]);
	return $section;
};

Scroll.prototype.insertTable = function(rows, cols){
	var $table = $("table");
	var trArr = [];
	for(var i=0; i < rows; i++){
		trArr[i] = $("tr");
		for(var j=0; j < cols; j++){
			trArr[i].append("td");
		}
	}
	$table.append(trArr);
	this.pasteHtmlAtCaret($table.html());
};

/**
 * Inserts a DOM node at the current caret position
 * @param node - A DOM node. In jquery this is $elem[0].
 */
Scroll.prototype.insertNodeAtCaret = function(node, selectPastedContent) {
	var range;
	// IE9+ and non-IE
	range = window.getSelection().getRangeAt(0);
	range.deleteContents();

	// delete whatever is on the range
	range.deleteContents();
	// place your span
	range.insertNode(node);
}

$(document).ready(function(){
	window._scrl = new Scroll();
});
