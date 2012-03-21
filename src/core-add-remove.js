(function($, $$){
	
	$$.fn.core({
		add: function(opts){
			
			var elements = [];
			
			this.noNotifications(function(){
				
				// add the element
				if( $$.is.element(opts) ){
					var element = opts;
					elements.push(element);
					
					element.restore();
				}
				
				// add the collection
				else if( $$.is.collection(opts) ){
					var collection = opts;
					collection.each(function(i, ele){
						elements.push(ele);
					});
					
					collection.restore();
				} 
				
				// specify an array of options
				else if( $$.is.array(opts) ){
					$.each(opts, function(i, elementParams){
						if( params != null && params.group != null ){
							elements.push(new $$.CyElement( cy, $.extend({}, elementParams, { group: params.group }) ));
						} else {
							elements.push(new $$.CyElement( cy, elementParams ));
						}
					});
				}
				
				// specify via opts.nodes and opts.edges
				else if( $$.is.plainObject(opts) && ($$.is.array(opts.nodes) || $$.is.array(opts.edges)) ){
					$.each(["nodes", "edges"], function(i, group){
						if( $$.is.array(opts[group]) ){
							$.each(opts[group], function(i, eleOpts){
								elements.push(new $$.CyElement( cy, $.extend({}, eleOpts, { group: group }) ));
							});
						} 
					});
				}
				
				// specify options for one element
				else {
					if( params != null && params.group != null ){
						elements.push(new $$.CyElement( cy, $.extend({}, opts, { group: params.group }) ));
					} else {
						elements.push(new $$.CyElement( cy, opts ));
					}
				}
			});
			
			this.notify({
				type: "add",
				collection: elements
			});
			
			
			return new $$.CyCollection( cy, elements );
		},
		
		remove: function(collection){
			if( !$$.is.elementOrCollection(collection) ){
				collection = collection;
			} else {
				var selector = collection;
				collection = this.filter( selector );
			}
			
			return collection.remove();
		},
		
		load: function(elements, onload, ondone){
			var cy = this;
			
			// remove old elements
			cy.elements().remove();

			cy.notifications(false);
			
			if( elements != null ){
				if( $$.is.plainObject(elements) ){
					$.each(["nodes", "edges"], function(i, group){

						var elementsInGroup = elements[group];
						if( elementsInGroup != null ){
							$.each(elementsInGroup, function(i, params){
								var element = new $$.CyElement( cy, $.extend({}, params, { group: group }) );
							});
						}
					});
				} else if( $$.is.array(elements) ){
					$.each(elements, function(i, params){
						var element = new $$.CyElement( cy, params );
					});
				}

			}
			
			function callback(){
				cy.layout( $.extend({}, cy._private.options.layout, {
					ready: function(){
						cy.notifications(true);

						cy.notify({
							type: "load", // TODO should this be a different type?
							collection: cy.elements(),
							style: cy._private.style
						});

						if( $$.is.fn(onload) ){
							onload.apply(cy, [cy]);
						}
						cy.trigger("load");
						cy.trigger("layoutready");
					},
					stop: function(){
						if( $$.is.fn(ondone) ){
							ondone.apply(cy, [cy]);
						}
						cy.trigger("layoutdone");
					}
				}) );


			}

			// TODO remove timeout when chrome reports dimensions onload properly
			// only affects when loading the html from localhost, i think...
			if( window.chrome ){
				setTimeout(function(){
					callback();
				}, 30);
			} else {
				callback();
			}

			return this;
		}
	});
	
})(jQuery, jQuery.cytoscapeweb);
