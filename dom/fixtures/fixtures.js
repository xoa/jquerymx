steal.plugins('jquery/dom').then(function($){
	if(jQuery.browser.rhino){
        print("\nWARNING! The Fixture Plugin Is Included!!!!!!\n")
    }
	// 
	//  fixture =
	//    true
	//    "some name"
	//    function(){ ... }
	//  default ... 
	//    true ... all are on
	//    false ... all are off ... just don't include
	//    function ... uses this function to convert true, some name
	//   
	
	var ajax = $.ajax;

// break
/**
 * @constructor jQuery.fixture
 * @parent dom
 * 
 * Fixtures simulate AJAX responses by overwriting [jQuery.ajax $.ajax], [jQuery.get $.get], and [jQuery.post $.post].  
 * They are a great technique to use when you want to develop JavaScript 
 * independently of the backend. 
 * 
<h3>Quick Examples</h3>
@codestart
//Named Fixture
$.ajax({url: "task.json",
  dataType: "json",
  type: "get",
  fixture: "fixtures/first.json", //looks in fixtures/first.json (relative to the page)
  success: myCallback});
@codeend
<h2>Using Fixtures</h2>
To enable fixtures, you must include this plugin and set the fixture property.  The fixture
property is set as:
@codestart
// a property with $.ajax
$.ajax({fixture: FIXTURE_VALUE})

// a parameter in $.get and $.post
$.get (  url, data, callback, type, FIXTURE_VALUE )
$.post(  url, data, callback, type, FIXTURE_VALUE )
@codeend
<h2>Types of Fixtures</h2>
<p>There are 2 types of fixtures</p>
<ul>
	<li><b>Static</b> - the response is in a file.
	</li>
	<li>
		<b>Dynamic</b> - the response is generated by a function.
	</li>
</ul>
There are different ways to lookup static and dynamic fixtures.
<h3>Static Fixtures</h3>
Static fixture locations can be calculated:
@codestart
// looks in test/fixtures/tasks/1.get
$.ajax({type:"get", 
       url: "tasks/1", 
       fixture: true}) 
@codeend
Or provided:
@codestart
// looks in fixtures/tasks1.json relative to page
$.ajax({type:"get", 
       url: "tasks/1", 
       fixture: "fixtures/task1.json"})

// looks in fixtures/tasks1.json relative to jmvc root
$.ajax({type:"get", 
       url: "tasks/1", 
       fixture: "//fixtures/task1.json"})` 
@codeend

<h3>Dynamic Fixtures</h3>
<p>Dynamic Fixtures are functions that return the params the $.ajax callback properties 
(beforeSend, success, complete, error)
will be called with.  </p>
<p>For example, "success" of a json request is called with data, textStatus,
XMLHttpRequest.</p>
<p>There are 2 ways to lookup dynamic fixtures.<p>
They can provided:
@codestart
//just use a function as the fixture property
$.ajax({
  type:     "get", 
  url:      "tasks",
  data:     {id: 5},
  dataType: "json",
  fixture: function(settings, callbackType){
    var xhr = {responseText: "{id:"+settings.data.id+"}"}
    switch(callbackType){
      case "success": 
        return [{id: settings.data.id},"success",xhr]
      case "complete":
        return [xhr,"success"]
    }
  }
})
@codeend
Or found by name on $.fixture:
@codestart
// add your function on $.fixture
// We use -FUNC by convention
$.fixture["-myGet"] = function(settings, cbType){...}

// reference it
$.ajax({
  type:"get", 
  url: "tasks/1", 
  dataType: "json", 
  fixture: "-myGet"})
@codeend

     * 
     * @init
     * Takes an ajax settings and returns a url to look for a fixture.  Overwrite this if you want a custom lookup method.
     * @param {Object} settings
     * @return {String} the url that will be used for the fixture
     */
	
	
	
	
	$.fixture = function(settings){
		var url = settings.url, match, left, right;
        url = url.replace(/%2F/g,"~").replace(/%20/g,"_");
		
		if ( settings.data && settings.processData && typeof settings.data !== "string" )
			settings.data = jQuery.param(settings.data);
		
        if(settings.data && settings.type.toLowerCase() == "get") 
            url += ($.String.include(url,'?') ? '&' : '?') + settings.data

        match = url.match(/^(?:https?:\/\/[^\/]*)?\/?([^\?]*)\??(.*)?/);
		left = match[1];
		
		right = settings.type ? '.'+settings.type.toLowerCase() : '.post';
		if(match[2]){
			left += '/';
			right = match[2].replace(/\#|&/g,'-').replace(/\//g, '~')+right;
		}
        return left + right;

	}
	$.extend($.fixture, {
        /**
         * Provides a rest update fixture function
         */
		"-restUpdate": function(settings,cbType){
            switch(cbType){
                case "success": 
                    return [jQuery.extend({id: parseInt(settings.url)}, settings.data)]
                case "complete":
                    return [{ responseText: ""}, "success"]
            }
        },
		/**
         * Provides a rest destroy fixture function
         */
        "-restDestroy" : function(){return [true]},
		/**
         * Provides a rest create fixture function
         */
        "-restCreate" : function(settings, cbType){
            switch(cbType){
                case "success": 
                    return [{id: parseInt(Math.random()*1000)}];
                case "complete":
                    return [{
                                responseText: "",
                                getResponseHeader: function(){ return "/blah/"+parseInt(Math.random()*1000) }
                            }, "success"]
            }

            
        },
/**
Used to make fixtures for findAll / findOne style requests.
@codestart
//makes a threaded list of messages
$.fixture["-make"](["messages","message"],1000, function(i, messages){
  return {
    subject: "This is message "+i,
    body: "Here is some text for this message",
    date: Math.floor( new Date().getTime() )
    parentId : i < 100 ? null : Math.floor(Math.random()*i)
  }
})
//uses the message fixture to return messages limited by offset, limit, order, etc.
$.ajax({
  url: "messages",
  data:{ 
     offset: 100, 
     limit: 50, 
     order: "date ASC",
     parentId: 5},
   },
   fixture: "-messages",
   success: function(messages){  ... }
});
@codeend
@param {Array} types An array of the fixture names
@param {Number} count the number of items to create
@param {Function} make a function that will return json data representing the object.
 */
		"-make" : function(types, count, make){
			//make all items now ....
			var items = []
			for(var i = 0 ; i < (count); i++){
				var num = i;
				var item =  make(i, items)
				if(!item.id){
					item.id =  num;
				}
				items.push(item)
			}
			$.fixture["-"+types[0]] = function(settings){
				
				
				var retArr = items.slice(0);
	
				
				$.each((settings.data.order || []).slice(0).reverse(), function(i, name){
					var split = name.split(" ");
					retArr = retArr.sort(function(a, b){
						if(split[1].toUpperCase() != "ASC")
							return a[split[0]] < b[split[0]]
						else
							return a[split[0]] > b[split[0]]
					})
				})
				$.each((settings.data.group || []).slice(0).reverse(), function(i, name){
					var split = name.split(" ");
					retArr = retArr.sort(function(a, b){

						return a[split[0]] > b[split[0]]
					})
				})
				var offset = settings.data.offset || 0;
				var  limit = settings.data.limit || (count - offset)
				
				var i =0;
				for(var param in settings.data){
					if(param.indexOf("Id") != -1){
						while(i < retArr.length){
							if(settings.data[param] != retArr[i][param]){
								retArr.splice(i, 1)
							}else{
								i++;
							}
						}
					}	
				}
				
				
				return [{
					"count": retArr.length,
					"limit": settings.data.limit,
					"offset": settings.data.offset,
					"data" : retArr.slice(offset,offset+ limit)
				}]
			}
			$.fixture["-" + types[1]] = function(settings){
				for(var i = 0 ; i < (count); i++){
					if(settings.data.id == items[i].id){
						return [items[i]]
					}
				}
			}
			$.fixture["~"+types[0]] = items;
		}
    })
	
	
/**
 *  @add jQuery
 */
// break
$.
/**
 * Adds the fixture option to settings. If present, loads from fixture location instead
 * of provided url.  This is useful for simulating ajax responses before the server is done.
 * @param {Object} settings
 */
	ajax = function(settings){
		var func = $.fixture
		if (!settings.fixture) {
			return ajax.apply($, arguments);
		}
		if($.fixture["-handleFunction"](settings)){
			return;
		}
		if (typeof settings.fixture == "string") {
			var url =  settings.fixture;
			if(/^\/\//.test(url)){
				url = steal.root.join(settings.fixture.substr(2))
			}
			//@steal-remove-start
			steal.dev.log("looking for fixture in "+url)
			//@steal-remove-end
			
			settings.url = url
			settings.data = null;
			settings.type = "GET"
			if(!settings.error){
				settings.error = function(xhr, error, message){
					throw "fixtures.js Error "+error+" "+message;
				}
			}
			return ajax(settings);
			
		}
		var settings = jQuery.extend(true, settings, jQuery.extend(true, {}, jQuery.ajaxSettings, settings));
		
		settings.url = steal.root.join('test/fixtures/'+func(settings)); // convert settings
		settings.data = null;
		settings.type = 'GET';
		return ajax(settings);		
	}
	$.fixture["-timeout"] = 100
	$.fixture["-handleFunction"] = function(settings){
		if (typeof settings.fixture == "string" && $.fixture[settings.fixture]) {
			settings.fixture = $.fixture[settings.fixture]
		}
		if (typeof settings.fixture == "function") {
                setTimeout(function(){
                    if(settings.success)
                        settings.success.apply(null, settings.fixture(settings, "success")  )
                    if(settings.complete)
                        settings.complete.apply(null, settings.fixture(settings, "complete")  )
                }, $.fixture["-timeout"])
            return true;
		}
		return false;
	}
	
	var get = $.get;
$.
	/**
	 * Adds a fixture param.  
	 * @param {Object} url
	 * @param {Object} data
	 * @param {Object} callback
	 * @param {Object} type
	 * @param {Object} fixture
	 */
	get = function( url, data, callback, type, fixture ){
		// shift arguments if data argument was ommited
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = null;
		}

		return jQuery.ajax({
			type: "GET",
			url: url,
			data: data,
			success: callback,
			dataType: type,
			fixture : fixture
		});
	}
	var post = $.post;
$.
	/**
	 * Adds a fixture param.
	 * @param {Object} url
	 * @param {Object} data
	 * @param {Object} callback
	 * @param {Object} type
	 * @param {Object} fixture
	 */
	post= function( url, data, callback, type, fixture ) {
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = {};
		}

		return jQuery.ajax({
			type: "POST",
			url: url,
			data: data,
			success: callback,
			dataType: type,
			fixture : fixture
		});
	}
    
    
	

    
    

	
});


