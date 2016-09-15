$(function() {
    /**
     * Specificy all dependent JS files except jQuery CORE, this has to be done outside in a <script> tag
     * */
    var dependencies = ['https://code.jquery.com/ui/1.11.4/jquery-ui.min.js', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js', 'https://malsup.github.io/jquery.blockUI.js', 'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.3/toastr.min.js'
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
        var $cardcontainer = $('#cardcontainer');
        var $cardcontrols = $(".cardcontrol");
        var $gamecontainer = $("#gamecontainer");
        var $btnStartGame = $("#btnStartGame");
        var $template = null;
        var TOTAL_CARDS_PER_FETCH = 5;
        var stack = new CardStack();
        /*
         * Event handler bindings
         * */


        /*
         *
         * Business Functions
         *
         * **/
        initHandleBarTemplate = function() {

            var source = $("#card-template").html();
            $template = Handlebars.compile(source);

        }
        setCard = function(movie) {
            var html = $template(movie);

            $cardcontainer.empty();
            $cardcontainer.append(html);
        }
        loadCards = function(year, noofcards) {
            var $defer = $.Deferred();
            btapi.getCards(year, noofcards,stack.getExcludedCardIds()).done(function(movies, xhr, status) {
                var posterPaths = [];
                for (movie of movies) {
                    posterPaths.push(movie.PosterPath);
                    stack.push(movie);
                }
                preload(posterPaths).done(function() {
                    console.log("images preloaded");
                    $defer.resolve();
                });
            });
            return $defer;
        };
        openNextCard = function() {
            var card = stack.shift();
            setCard(card);
            stack.markAsPlayed(card);
            console.log(stack._playedCards);
        }

        /**
         *
         * Utilities
         * */

        function preload(args) {

            var $defer = $.Deferred();
            var preload = args;
            var promises = [];
            for (var i = 0; i < preload.length; i++) {
                (function(url, promise) {
                    var img = new Image();
                    img.onload = function() {
                        console.log("loaded:" + url);
                        promise.resolve();

                    };
                    console.log("loading:" + url);
                    img.src = url;
                })(preload[i], promises[i] = $.Deferred());
            }
            $.when.apply($, promises).done(function() {
                console.log("All images ready sir!");
                $defer.resolve();
            });

            return $defer;
        }
        /*
         * Onload events
         * **/
        $gamecontainer.block({
            message: "wait.."
        });
        initHandleBarTemplate();
        loadCards(GLOBAL.DECADE, TOTAL_CARDS_PER_FETCH).done(function() {
            $gamecontainer.unblock();
            $gamecontainer.hide();
            $btnStartGame.show();

        });



        $btnStartGame.click(function() {
            $gamecontainer.show();
            $btnStartGame.hide();
            openNextCard();

        })
        $cardcontrols.click(function() {
            openNextCard();
            loadCards(GLOBAL.DECADE, TOTAL_CARDS_PER_FETCH).done(function() {
            });
        });


    }

});
