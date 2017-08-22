<?php namespace Klyp\PageBuilder;

use Event;
use System\Classes\PluginBase;
use System\Classes\SettingsManager;
use Klyp\PageBuilder\Models\Settings;

/**
 * PageBuilder Plugin Information File
 */
class Plugin extends PluginBase
{
    /**
     * Returns information about this plugin.
     *
     * @return array
     */
    public function pluginDetails()
    {
        return [
            'name'        => 'Klyp Page Builder',
            'description' => 'Easily order component on pages.',
            'author'      => 'Klyp',
            'icon'        => 'icon-leaf'
        ];
    }

    /**
     * Register settings.
     *
     * @return array
     */
    public function registerSettings()
    {
        return [
            'settings'          => [
                'label'         => 'Klyp Builder Settings',
                'description'   => 'Settings for Klyp Page Builder',
                'icon'          => 'icon-pencil-square-o',
                'class'         => 'Klyp\PageBuilder\Models\Settings',
                'category'      => SettingsManager::CATEGORY_CMS
            ]
        ];
    }

    /**
     * Register formwidget
     *
     * @return void
     */
    public function registerFormWidgets()
    {
        return [
            'Klyp\PageBuilder\FormWidgets\PageBuilder' => [
                'label' => 'Klyp Page Builder',
                'alias' => 'klyppagebuilder'
            ]
        ];
    }

    /**
     * Boot method, called right before the request route.
     *
     * @return void
     */
    public function boot()
    {
        Event::listen('backend.form.extendFields', function ($form) {
            if (get_class($form->config->model) == 'Cms\Classes\Page' && Settings::get('klyp_builder_cms', true)) {
                // remove the existing two fields and add them back again later
                // in order to reorder these fields
                $form->removeField('markup');
                $form->removeField('code');

                // add our custom page builder field
                $form->addSecondaryTabFields(
                    [
                        'markup' => [
                            'tab' => 'Klyp Builder',
                            'stretch'=> true,
                            'type'=>'Klyp\PageBuilder\FormWidgets\PageBuilder'
                        ],
                        'code' => [
                            'tab' => 'cms::lang.editor.code',
                            'stretch'=> true,
                            'type'=> 'codeeditor',
                            'language'=> 'php'
                        ]
                    ]
                );
            }

            return;
        });
    }
}
