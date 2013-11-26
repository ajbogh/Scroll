/**
 * @license Copyright (c) 2013, First American Title - Allan Bogh. All rights reserved.
 * For licensing, see LICENSE.md
 */

CKEDITOR.plugins.add( 'mustachetemplate', {
	lang: 'en', // %REMOVE_LINE_CORE%
	icons: 'mustachetemplate', // %REMOVE_LINE_CORE%
	hidpi: true, // %REMOVE_LINE_CORE%

	init: function( editor ) {
		// Register the "source" command, which simply opens the "source" dialog.
		editor.addCommand( 'mustachetemplate', {
			exec : function( editor ) {
				var timestamp = new Date();
				editor.insertHtml( 'The current date and time is: <em>' + timestamp.toString() + '</em>' );
			}
		});

		// If the toolbar is available, create the "Source" button.
		if ( editor.ui.addButton ) {
			editor.ui.addButton( 'MustacheTemplate', {
				label: editor.lang.mustachetemplate.toolbar,
				command: 'mustachetemplate',
				toolbar: 'mode,10'
			});
		}
	}
});
