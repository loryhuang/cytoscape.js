;(function($, $$){
	
	$$.fn.core = function( impl, options ){
		$.each(impl, function(name, fn){
			console.log(name);
			
			CyCore.prototype[ name ] = fn;
		});
	};
	
	function CyCore( opts ){
		var cy = this;
		
		var defaults = {
			layout: {
				name: "grid"
			},
			renderer: {
				name: "svg"
			},
			style: { // actual default style later specified by renderer
			}
		};
		
		var options = $.extend(true, {}, defaults, opts);
		
		if( options.container == null ){
			$$.console.error("Cytoscape Web must be called on an element; specify `container` in options or call on selector directly with jQuery, e.g. $('#foo').cy({...});");
			return;
		} else if( $(options.container).size() > 1 ){
			$$.console.error("Cytoscape Web can not be called on multiple elements in the functional call style; use the jQuery selector style instead, e.g. $('.foo').cy({...});");
			return;
		}
		
		this._private = {
			options: options, // cached options
			style: options.style,
			nodes: {}, // id => node object
			edges: {}, // id => edge object
			continuousMapperBounds: { // data attr name => { min, max }
				nodes: {},
				edges: {}
			},
			continuousMapperUpdates: [],
			live: {}, // event name => array of callback defns
			selectors: {}, // selector string => selector for live
			listeners: {}, // cy || background => event name => array of callback functions
			animation: { 
				// normally shouldn't use collections here, but animation is not related
				// to the functioning of CySelectors, so it's ok
				elements: null // elements queued or currently animated
			},
			scratch: {}, // scratch object for core
			layout: null,
			renderer: null,
			notificationsEnabled: true, // whether notifications are sent to the renderer
			zoomEnabled: true,
			panEnabled: true
		};
		
		console.log( this._private );
		
		cy.initRenderer( options.renderer );
		
		// initial load
		cy.load(options.elements, function(){ // onready
			var data = $(options.container).data("cytoscapeweb");
			
			if( data == null ){
				data = {};
			}
			data.cy = cy;
			data.ready = true;
			
			if( data.readies != null ){
				$.each(data.readies, function(i, ready){
					cy.bind("ready", ready);
				});
				
				data.readies = [];
			}
			
			$(options.container).data("cytoscapeweb", data);
			
			cy.startAnimationLoop();
			
			if( $$.is.fn( options.ready ) ){
				options.ready.apply(cy, [cy]);
			}
			
			cy.trigger("ready");
		}, function(){ // ondone
			if( $$.is.fn( options.done ) ){
				options.done.apply(cy, [cy]);
			}
			
			cy.trigger("done");
		});
	}
	$$.CyCore = CyCore; // expose
	
	$$.fn.core({
		container: function(){
			return $( this._private.options.container );
		}
	});
	
})(jQuery, jQuery.cytoscapeweb);
