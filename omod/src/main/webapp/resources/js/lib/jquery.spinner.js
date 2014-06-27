/**
 * Created by alex on 6/26/14.
 */
(function($){

    $.fn.spinner = function(options){
        var _defaults={
            type: 'float',                  // or 'int'
            floatPrecission: 2,             // decimal precission
            ui: true,                       // +/- buttons
            allowWheel: true,               // mouse wheel
            allowArrows: true,              // keyboar arrows (up, down)
            arrowStep: 1,                   // ammount to increment with arrow keys
            wheelStep: 1,                   // ammount to increment with mouse wheel
            limit: [null, null],            // [min, max] limit
            preventWheelAcceleration: true,

            onStep: null,   // fn( [number] val, [bool] up )
            onWheel: null,  // fn( [number] val, [bool] up )
            onArrow: null,  // fn( [number] val, [bool] up )
            onButton: null, // fn( [number] val, [bool] up )
            onKeyUp: null   // fn( [number] val )

        };

        return $(this).each( function(){
            var $data = $(this).data();
            delete $data.spinner;


        $this.spinner = (function()
        {
            return {
                limit: _limit,
                decimalRound: _decimal_round,
                onStep: function( callback ) { _options.onStep = callback; },
                onWheel: function( callback ) { _options.onWheel = callback; },
                onArrow: function( callback ) { _options.onArrow = callback; },
                onButton: function( callback ) { _options.onButton = callback; },
                onKeyUp: function( callback ) { _options.onKeyUp = callback; }
            };
        })();

            var _options = $.extend({}, _defaults, options, $data),
                $this = $(this),
                $wrap = $('<div id="spinner" class="spinner">');
        $this.data('spinner', $this.spinner);

            if( _options.ui )
            {
                var $btnUp   = $('<div class="spinner"').appendTo( $wrap ),
                    $btnDown = $('<div class="spinner" >').appendTo( $wrap );

                $this.addClass('ui-spinner-input-spinner');
                var stepInterval;

                $btnUp.mousedown(function(e)
                {
                    e.preventDefault();

                    var val = _step( _options.arrowStep );
                    _evt('Button', [val, true]);
                });

                $btnDown.mousedown(function(e)
                {
                    e.preventDefault();

                    var val = _step( -_options.arrowStep );
                    _evt('Button', [val, false]);
                });

                $(document).mouseup(function()
                {
                    clearInterval( stepInterval );
                });
            }
        });
    }


})(jQuery);
