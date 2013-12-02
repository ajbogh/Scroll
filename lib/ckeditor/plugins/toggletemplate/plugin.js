/**
 * @license Copyright (c) 2013, First American Title - Allan Bogh. All rights reserved.
 * For licensing, see LICENSE.md
 */

CKEDITOR.plugins.add( 'toggletemplate', {
	lang: 'en', // %REMOVE_LINE_CORE%
	icons: 'toggletemplate', // %REMOVE_LINE_CORE%
	hidpi: true, // %REMOVE_LINE_CORE%

	init: function( editor ) {
		editor.addCommand( 'toggletemplate', {
			exec : function( editor ) {
				editor.element.setHtml(editor.templateProcessor.toggleTemplate(editor.element.getHtml()));
			},
			modes : { wysiwyg : 1 }
		});

		// If the toolbar is available, create the "Source" button.
		if ( editor.ui.addButton ) {
			editor.ui.addButton( 'ToggleTemplate', {
				label: editor.lang.toggletemplate.toolbar,
				command: 'toggletemplate',
				toolbar: 'mode,10'
			});
		}
	}
});
