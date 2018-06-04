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

    function get_images_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return images_url + "&" + $.param(pp);
    }

    self.get_images = function () {
        $.getJSON(get_images_url(0, 20), function (data) {
            self.vue.images = data.images;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.images);
        });
        self.vue.self_page = true;
    };

    self.get_more = function () {
        var num_memos = self.vue.memos.length;
        $.getJSON(get_images_url(num_memos, num_memos + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.images, data.images);
            enumerate(self.vue.images);
        });
    };

    function get_user_images_url(user_email, start_idx, end_idx) {
        var pp = {
            user_email: user_email,
            start_idx: start_idx,
            end_idx: end_idx
        };
        return user_images_url + "?" + $.param(pp);
    }

    self.get_user_images = function (user_email) {
        $.getJSON(get_user_images_url(user_email,0, 20), function (data) {
            self.vue.images = data.images;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.images);
        });
        self.vue.self_page = false;
    };

    self.get_users = function () {
        $.getJSON(users_url, function (data) {
            self.vue.users = data.users;
            enumerate(self.vue.users);
        });
    };

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
        $.post(add_image_url,
            {
                image_url: get_url
            },
            function (data) {
                setTimeout(function() {
                    self.vue.images.unshift(data.image);
                    enumerate(self.vue.images);
                }, 1000);
            });
    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            images: [],
            users: [],
            is_uploading: false,
            self_page: true // Leave it to true, so initially you are looking at your own images.
        },
        methods: {
            get_images: self.get_images,
            get_more: self.get_more,
            get_users: self.get_users,
            get_user_images: self.get_user_images,
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
        }

    });

    self.get_images();
    self.get_users();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
