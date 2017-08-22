<?php namespace Klyp\PageBuilder\Models;

use Model;
use October\Rain\Support\ValidationException;

/**
 * Settings Model
 */
class Settings extends Model
{
    use \October\Rain\Database\Traits\Validation;

    /**
     *  Implements site-wide settings
     */
    public $implement = ['System.Behaviors.SettingsModel'];
    public $settingsCode = 'klyp_settings';
    public $settingsFields = 'fields.yaml';

    /**
     * @var array  Validation rules.
     */
    public $rules = [
        'klyp_builder_cms'  => ['required', 'boolean'],
    ];
}
