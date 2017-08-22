<?php namespace Klyp\PageBuilder\FormWidgets;

use Backend\Classes\FormWidgetBase;

class PageBuilder extends FormWidgetBase
{
    /**
     * Widget details
     *
     * @return array
     */
    public function widgetDetails()
    {
        return [
            'name'        => 'Klyp Page Builder',
            'description' => 'Description goes here'
        ];
    }

    /**
     * On plugin render
     *
     * @return array
     */
    public function render()
    {
        $this->prepareVars();

        return $this->makePartial('default');
    }

    /**
     * Preparing variables
     *
     * @return void
     */
    public function prepareVars()
    {   
        $this->vars['value'] = $this->getLoadValue();
        $this->vars['markupValue'] = $this->prepareMarkup(htmlentities($this->getLoadValue()));
        $this->vars['name'] = $this->getFieldName();
        $this->vars['formId'] = 'Form-' . str_replace(array('PageBuilder-', 'Markup-markup'), array('', ''), $this->getId());
    }

    /**
     * Load widget assets
     *
     * @return void
     */
    protected function loadAssets()
    {
        $this->addCss('css/pagebuilder.css');
        $this->addCss('js/trumbowyg/ui/trumbowyg.min.css');
        $this->addJs('js/jquery-ui.min.js');
        $this->addJs('js/pagebuilder.js');
        $this->addJs('js/trumbowyg/trumbowyg.min.js');
    }

    /**
     * Search and replace
     *
     * @var string
     * @return string
     */
    public function prepareMarkup($string) {
        $componentTemplate = file_get_contents(plugins_path() . '/klyp/pagebuilder/formwidgets/pagebuilder/partials/_component-template.htm');
        $rawTemplate = file_get_contents(plugins_path() . '/klyp/pagebuilder/formwidgets/pagebuilder/partials/_raw-template.htm');

        $markUps = preg_split ('/{% (.*) %}/' , $string, -1, PREG_SPLIT_DELIM_CAPTURE);
        $markUpText = [];

        foreach ($markUps as $markUp) {
            if (trim(preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $markUp)) != '') {

                // if component
                if (preg_match("/component '(.*)'/", $markUp, $match)) {
                    $markUpText[] = str_replace('{}', $match[1], $componentTemplate);
                } else {
                    $markUpText[] = str_replace('{}', $markUp, $rawTemplate);
                }
            }
        }

        return implode('', $markUpText);
    }
}
