// This is the js for the default/index.html view.


var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.

    };

    self.upload_file = function (event) {
        // Reads the file.
        var input = event.target;
        var file = input.files[0];
        if (file) {
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };


    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        setTimeout(function() {
            $.post(add_image_url,
            {
                image_url: get_url
            },
            function(data) {
            $.web2py.enableElement($("#add_image_url"));
            self.vue.images.push(data.image_data);
            enumerate(self.vue.images);
            })
        }, 1000)
    };

    function get_image_url(current_id) {
        var pp = {
            current_id: current_id
        }
        return images_url + "?" + $.param(pp);
    }

    self.get_images = function(cuser){
        $.getJSON(get_image_url(cuser), function(data) {
            self.vue.images = data.images;
            self.vue.self_id = data.user_id;
            if (data.user_id == 0) {
                self.vue.self_page = false;
                if (self.vue.users.length > 0) {
                    self.vue.user_id = self.vue.users[0].id;
                }
            }
            else {
                self.vue.user_id = data.user_id;
            }
            enumerate(self.vue.images);
        })
    };

    self.select_user = function(id) {
        self.vue.user_id = id;
        self.vue.self_page = (id == self.vue.self_id);
        console.log(id);
        setTimeout(function() {
            self.get_images(self.vue.user_id);
        }, 100);
    };

    self.get_user = function() {
        $.getJSON(get_user_url, 
            function(data) {
                self.vue.users = data.users;
                if (data.user_id == 0) {
                    if (self.vue.users.length > 0) {
                        self.vue.user_id = self.vue.users[0].id;
                    }
                }
                else {
                    self.vue.user_id = data.user_id;
                }
                console.log("in get users " + self.vue.user_id);
                enumerate(self.vue.users);
                setTimeout(function() {
                    self.get_images(self.vue.user_id);
                }, 100);
            })
        console.log('called get user')
    };

    self.delete_images = function(index) {
        $.post(del_image_url,
        {
            id: self.vue.images[index].id
        },
        function() {
            self.vue.images.splice(index, 1);
            enumerate(self.vue.images);
        })
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_uploading: false,
            self_page: true, // Leave it to true, so initially you are looking at your own images.
            images: [],
            users: [],
            user_id: 0,
            self_id: 0
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            select_user: self.select_user,
            delete_images: self.delete_images
        }

    });
    
    self.get_user();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

