+function ($) { "use strict"; 
    $(document).render(function () {

        var klypBuilder = $('.klyp__builder'),
            klypBuilderWrapper = $('.klyp__builder-wrapper', klypBuilder),
            klypBuilderSortable = $('.klyp__builder-sortable', klypBuilderWrapper),
            componentList = $('.component-list .components div.layout div.layout-row div.layout-cell'),
            existingComponentLists = $('[data-control="toolbar"] .layout'),
            existingComponentList = $('.layout-cell', existingComponentLists),
            delay = (function(){
                var timer = 0;
                return function(callback, ms){
                    clearTimeout (timer);
                    timer = setTimeout(callback, ms);
                };
            })(),
            editorConfig = {
                btns: [
                    ['viewHTML'],
                    ['undo', 'redo'],
                    ['formatting'],
                    'btnGrp-design',
                    ['link'],
                    ['insertImage'],
                    'btnGrp-justify',
                    'btnGrp-lists',
                    ['foreColor', 'backColor'],
                    ['preformatted'],
                    ['horizontalRule'],
                    ['fullscreen']
                ],
                removeformatPasted: true
            };


        createEditor();

        // Sortable items
        klypBuilderSortable.sortable({
            handle: '.klyp__builder-handler',
            update : function (event, ui) {
                var theForm = getFormId($(this).closest(klypBuilder));
                refreshContent(theForm)
            }
        });

        // Draggable items
        componentList.draggable({
            revert: true
        });

        // Dropable area
        klypBuilder.droppable({
            activeClass: 'klyp__builder-drop-active',
            hoverClass: 'klyp__builder-drop-hover',
            accept: componentList,
            drop: function(event, ui) {
                var theForm = getFormId(this);
                ui.draggable.click();
                return false;
            }
        });

         // On Component click, we add to the list delaying 0.1sec
        componentList.off('click').on('click', function(e) {
            $.each($('#cms-master-tabs .tab-pane.layout-cell.active'), function(index, element) {
                if ($(this).attr('class') == 'tab-pane layout-cell active') {
                    var theForm = $('.klyp__builder-form-id', $(this)).val();
                    setTimeout(function(){
                        queueComponent($(this), theForm);
                    }, 100);
                    return false;
                }
           });
        });

        // When delete the component
        $(document.body).off('click', '.klyp__builder-delete').on('click', '.klyp__builder-delete', function() {
            var theForm = getFormId($('.klyp__builder', $(this).closest('.form-group')));
            var componentDeleted = $('.klyp__builder-component-name', $(this).parent().parent()).text().replace(/'/g, '').trim();

            // delete component
            removeComponent(componentDeleted, theForm);
            // remove component from list
            $(this).parent().parent().remove();
            refreshContent(theForm);
            return false;
        });

        // When add new raw content
        $(document.body).off('click', '.klyp__builder-controls-add-raw').on('click', '.klyp__builder-controls-add-raw', function() {
            var theForm = $(this).data('form');
            addRawComponent(theForm);
            return false;
        });

        // Delay refresh content
        $(document.body).on('keyup change click', '.klyp__builder-raw-textarea, .trumbowyg-editor', function() {
            var theForm = getFormId($('.klyp__builder', $(this).closest('.form-group')));

            delay( function(){
                refreshContent(theForm);
            }, 1000 );
        });

        // When component list clicked, we show inspector
        $(document.body).off('click', '.klyp__builder-component-name').on('click', '.klyp__builder-component-name', function() {
            var componentAlias = $(this).text().replace(/'/g, '').trim(),
                currentComponent = '',
                linkToTop = $(this).offset().top,
                linkToLeft = $(this).offset().left,
                linkWidth = $(this).width(),
                theForm = getFormId($('.klyp__builder', $(this).closest('.form-group')));

            $('[data-control="toolbar"] .layout .layout-cell', $('#' + theForm)).each( function() {
                currentComponent = $(this).find('input[name="component_aliases[]"]');
                
                if (currentComponent.val() == componentAlias) {
                     $(currentComponent).click();

                    // re positioning the popup
                    $('.control-popover.control-inspector').removeClass('placement-bottom').addClass('placement-right'); 
                    $('.control-popover.control-inspector').css('top', linkToTop);
                    $('.control-popover.control-inspector').css('left', linkToLeft + linkWidth + 20);
                    return false;
                }
            });
        });

        /**
         * Get unique form id
         *
         * @var string string
         * @return string
        */
        function getFormId(selected) {
            return $('.klyp__builder-form-id', selected).val();
        }

        /**
         * Remove component
         *
         * @var string
         * @return void
         */
        function removeComponent(componentAlias, theForm) {
            var currentComponent = '';

            $('[data-control="toolbar"] .layout .layout-cell', $('#' + theForm)).each( function() {
                currentComponent = $('input[name="component_aliases[]"]', $(this)).val();

                if (currentComponent == componentAlias) {
                    $(this).find('.remove').click();
                    return false;
                }
            });
        }


        /**
         * Queue adding component
         *
         * @var string
         * @return void
         */
        function queueComponent(componentAlias, theForm) {
            var componentAlias = $('[data-component-name]', $(componentAlias)).val();
            var componentAliasSelected = getComponentAlias(componentAlias, theForm);

            addComponent(componentAliasSelected, theForm);
            // clean up component junks
            cleanupComponent();
            // refresh content
            refreshContent(theForm);
            return false;
        }

        /**
         * Get component alias
         *
         * @var string
         * @return string
         */
        function getComponentAlias(componentAlias, theForm) {
            var currentComponent = componentAlias;

            // get the last component
            $('#'+theForm).find('[data-control="toolbar"] .layout .layout-cell').each( function() {
                currentComponent = $(this).find('input[name="component_aliases[]"]').val().trim();
            });
            return currentComponent;
        }

        /**
         * Add new component to list
         *
         * @var string
         * @return void
         */
        function addComponent(componentAlias, theForm) {   
            var componentTemplate = '\
            <div class="ui-state-default klyp__builder-component">\
                <div class="klyp__builder-control col-sm-1">\
                    <div class="klyp__builder-handler"> <i class="icon-arrows"></i> </div>\
                    <div class="klyp__builder-delete"> <i class="icon-trash"></i> </div>\
                </div>\
                <div class="col-sm-11"><span class="klyp__builder-component-name">{}</span></div>\
            </div>';

            $('#' + theForm).find(klypBuilderSortable).append(componentTemplate.replace('{}', componentAlias));

            return false;
        }

        /**
         * Add new raw markup to list
         *
         * @var string
         * @return void
         */
        function addRawComponent(theForm) {
            var rawTemplate = '<div class="ui-state-default klyp__builder-component">\
                <div class="klyp__builder-control col-sm-1">\
                    <div class="klyp__builder-handler"> <i class="icon-arrows"></i> </div>\
                    <div class="klyp__builder-delete"> <i class="icon-trash"></i> </div>\
                </div>\
                <div class="klyp__builder-raw col-sm-11">\
                    <textarea class="klyp__builder-raw-textarea" rows="10"></textarea>\
                </div>\
            </div>';
            $('#' + theForm).find(klypBuilderSortable).append(rawTemplate);
            createEditor();
        }

        /**
         * Create editor
         *
         * @var array
         * @return void
         */
        function createEditor() {
            $('.klyp__builder-raw-textarea').trumbowyg(editorConfig);
        }

        /**
         * Refresh component list into textarea
         *
         * @var string
         * @return void
         */
        function refreshContent(theForm) {
            var components = [];
            $('#' + theForm).find('.klyp__builder-component').each(function() {
                var currentComponent = $(this);

                if($(this).find('.klyp__builder-component-name').length !== 0) {
                    components += '{% component \'' + currentComponent.find('.klyp__builder-component-name').text().trim() + '\' %}\n';
                } else {
                    components += $(this).find('.klyp__builder-raw-textarea').val() + '\n';
                }
            });

            // fill in the textarea
            $('#' + theForm).find('.klyp-textarea').val(components);
            return false;
        }

        /**
         * Clean up newly added component list
         *
         * @return void
         */
        function cleanupComponent() {
            // remove unnecessary classesa and data attributes
            existingComponentLists.find('.layout-cell').attr('style', '').removeClass('placeholder').removeData();
            return false;
        }
    });
}(window.jQuery);

