$(document).ready(function(){
	$("body").append(
		'<div id="scroll-sidebar" class="closed">
			<div id="scroll-sidebar-pullout-button" class="closed"></div>
			<div id="scroll-sidebar-content">
				<div id="scroll-sidebar-title"><h2>'+scroll.lang.widgets+'</h2></div>
				<div id="scroll-sidebar-panels"></div>
			</div>
		</div>'
	);
	console.log("test");
});