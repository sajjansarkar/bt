$(function() {
    /**
     * Specificy all dependent JS files except jQuery CORE, this has to be done outside in a <script> tag
     * */
    var dependencies = ['https://code.jquery.com/ui/1.11.4/jquery-ui.min.js', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js',
        'https://cdn.datatables.net/1.10.11/js/jquery.dataTables.min.js', 'https://malsup.github.io/jquery.blockUI.js', 'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.3/toastr.min.js'
    ];
    /*
     * Define the dependency loader
     * */
    $.loadDependencies = function(arr, path) {
            var _arr = $.map(arr, function(scr) {
                return $.getScript((path || "") + scr);
            });
            _arr.push($.Deferred(function(deferred) {
                $(deferred.resolve);
            }));
            return $.when.apply($, _arr);
        }
        /**
         * Load all dependent JS files and then call the application launcher function
         * this should be the starting point for all business logic
         *
         * Note, if any of the JS files failed to load, the fail() will execute and no further
         * JS files will be loaded.
         * */
    $.loadDependencies(dependencies).done(applicationLaunch).fail(function(error) {
        alert('Could not load one or more dependencies.');
    }).always(function() {});


    function applicationLaunch() {
        /*
         * Global AJAX settings
         * */
        $.ajaxSetup({
            dataType: "json"
        });
        /*
         * Global Toaster settings
         * */
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-bottom-full-width",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "slideDown",
            "hideMethod": "slideUp"
        };
        /**
         * Bootstrap jquery reconciliation
         * */
        /* the .tooltip() method has a conflict between jQuery and Bootstrap.
         * the below line makes sure that calling .tooltip() will execute jQuery's version
         *  */
        //	$.fn.bsTooltip = $.fn.tooltip.noConflict();
        /**
         * Cache
         *
         * */
        var $loading = $('#loading');
        var $ProgressBar = $('#ProgressBar');
        var $start = $('#start');
        var $end = $("#end");
        var $LoaderWrapper = $("#LoaderWrapper");
        /*
         * Event handler bindings
         * */
        $("#PullDataSubmitBtn").click(function() {
            $LoaderWrapper.show();
            var start = $start.val();
            var end = $end.val();
            var allMovies = [];
            loadMovieCache(start, end, allMovies).then(function() {
                console.log('Full Object loaded!' + allMovies);
                var req = {
                    method: "POST",
                    url: "/scraper/save",
                    data: $.param({
                        start: start,
                        end: end,
                        allMovies: JSON.stringify(allMovies)
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };
                setLoaderStatus("Saving dump to DB..",95);
                $.ajax(req).done(function(data) {
                    setLoaderStatus("Done!",100);
                    console.log(data);
                });
            });

        });

        /*
         *
         * Business Functions
         *
         * **/

        /**
         * Business logic start
         * */
        function loadMovies(start, end, allMovies) {

            var defer = $.Deferred();

            function after(movies, status, xhr) {
                console.log('year:' + start + ', no of movies:' + movies.length);
                $.merge(allMovies, movies);
                start++;
                if (start <= end) {
                    setLoaderStatus("Loading movies for year:" + start, (start * 100 / end));
                    cinemalytics.getMoviesByYear(start).done(after);
                } else {
                    console.log("Dong getting movies.");
                    defer.resolve("true");
                    //loadSongs(allMovies);
                }
            }
            setLoaderStatus("Loading movies for year:" + start, (start * 100 / end));
            cinemalytics.getMoviesByYear(start).done(after);
            return defer;
        }

        function loadSongs(allMovies) {
            var defer = $.Deferred();
            var start = 0;
            var end = allMovies.length;

            function after(songs, status, xhr) {
                var currMovie = allMovies[start];
                if (typeof(songs) == "undefined")
                    songs = [];
                console.log('id:' + currMovie.Id + ',name:' + currMovie.Title + ', no of songs:' + songs.length);
                currMovie.songs = songs;
                start++;
                if (start < end) {
                    setLoaderStatus("Loading songs for movie:" + currMovie.Title, (start * 100 / end));
                    cinemalytics.getSongsByMovieId(currMovie.Id).done(after);
                } else {
                    console.log("Dong getting songs.");
                    defer.resolve("true");
                }
            }
            setLoaderStatus("Loading songs for movie:" + allMovies[start].Title, (start * 100 / end));
            cinemalytics.getSongsByMovieId(allMovies[start].Id).done(after);
            return defer;
        }

        function loadMovieCache(start, end, allMovies) {
            return loadMovies(start, end, allMovies).then(function() {
                return loadSongs(allMovies)
            });
        }

        /**
         *
         * Utilities
         * */
        function makeYearPicker() {
            for (i = new Date().getFullYear(); i > 1900; i--) {
                $('.yearpicker').append($('<option />').val(i).html(i));
            }
        }

        function createDatatableFromJSON(tableID, json) {
            var $table = $(tableID);
            if ($.fn.DataTable.isDataTable(tableID)) {
                $table.dataTable().fnDestroy();
            };

            if (json.length > 0) {
                var cols = [];
                var first = json[0];
                for (var key in first) {
                    if (first.hasOwnProperty(key)) {
                        if (key == "Description")
                            continue;
                        cols.push({
                            "mDataProp": key,
                            "sTitle": key
                        });
                    }
                }

                $table.dataTable({
                    "aaData": json,
                    "aoColumns": cols
                });
            }
        }

        function setLoaderStatus(msg, percentcomplete) {
            var spinner = '<i class="fa fa-spinner fa-spin fa-pulse"></i>';
            if (percentcomplete < 100)
                msg = spinner + msg;
            $loading.html(msg);
            $ProgressBar.val(percentcomplete);
        }
        /*
         * Onload events
         * **/
        makeYearPicker();
        $LoaderWrapper.hide();
    }

});
