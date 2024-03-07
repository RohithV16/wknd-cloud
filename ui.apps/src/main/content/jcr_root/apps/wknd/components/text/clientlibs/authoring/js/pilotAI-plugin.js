/*************************************************************************
*	Copyright (c) 2012 Infosys Limited, Bangalore, India. All rights reserved.
*   Except for any free or open source software components embedded in this Infosys proprietary software program ("Program"),
*   this program is protected by copyright laws, international treatise and other pending or existing intellectual property rights
*   in India, the United States and other countries. Except as expressly permitted, any unauthorized reproduction, storage, transmission
*   in any form or by any means (including without limitation electronic, mechanical, printing, photocopying, recording or otherwise), or any
*    distribution of this Program, or any portion of it, may result in severe civil and criminal penalities, and will be prosecuted to the maximum
*    extent possible under the law.
*
**************************************************************************/
(function ($, CUI) {
    'use strict'

    const PLUGIN_NAME = 'pilotAI';

    const CONTENT_CREATION = 'creation';
    const CONTENT_TRANSLATION = 'translation';
    const CONTENT_TONE = 'tone';
    const CONTENT_REVIEW = 'review';
    const CONTENT_SUMMARIZATION = 'summarization';
    const CONTENT_ELABORATION = 'elaboration';
    const CONTENT_AUDIENCE = 'audience';

    const CONTENT_CREATION_TITLE = 'Use Open AI Content Creation';
    const CONTENT_TRANSLATION_TITLE = 'Use Open AI Content Translation';
    const CONTENT_TONE_TILE="Use Open AI to check/change Tone of the Selected Content";
    const CONTENT_REVIEW_TITLE = 'Use Open AI for Content Review';
    const CONTENT_SUMMARIZATION_TITLE = 'Use Open AI for Content Summarization';
    const CONTENT_ELABORATION_TITLE = 'Use Open AI for Content Elaboration';
    const CONTENT_AUDIENCE_TITLE = 'Use Open AI for Content Audience';

    const CREATION_ICON = 'draft';
    const TRANSLATION_ICON = 'globe';
    const TONE_ICON = 'promote';
    const REVIEW_ICON = 'trendInspect';
    const SUMMARIZATION_ICON = 'summarize';
    const ELABORATION_ICON = 'viewDetail';
    const AUDIENCE_ICON = 'demographic';


    CUI.rte.plugins.PilotAIPlugin = new Class({
        extend: CUI.rte.plugins.Plugin,
        toString: 'PilotAIPlugin',
        contentCreationUI: null,
        contentTranslationUI: null,
        contentToneUI: null,
        contentReviewUI: null,
        contentSummarizationUI: null,
        contentElaborationUI: null,
        contentAudienceUI: null,

        dialogHelper: null,
        contentCreationDialog: null,
        contentTranslationDialog: null,
        contentToneDialog:null,
        contentReviewDialog:null,
        contentSummarizationDialog:null, 
        contentElaborationDialog:null,
        contentAudienceDialog:null,

        getFeatures: function () {
            return [CONTENT_CREATION,CONTENT_TRANSLATION,CONTENT_TONE,CONTENT_REVIEW,CONTENT_SUMMARIZATION,CONTENT_ELABORATION,CONTENT_AUDIENCE];
        },

        showDialog: function(dialogName, command, dialogClassName) {
            var dm = this.editorKernel.getDialogManager();
            if (dm.isShown(this[dialogName]) && dm.toggleVisibility(this[dialogName])) {
                dm.hide(this[dialogName]);
                return;
            }
            if (!this[dialogName] || dm.mustRecreate(this[dialogName])) {
                var dialogHelper = dm.createDialogHelper();
                this.dialogHelper = dialogHelper;
                var dialogConfig = {
                    'configVersion': 1,
                    'defaultDialog': {
                        'dialogClass': {
                            'type': ''
                        }
                    },
                    'parameters': {
                        'editorKernel': this.editorKernel,
                        "command": this.pluginId + '#' + command
                    }
                };
                if (this.config['pilot' +dialogName + 'Config']) {
                    var addDialogConfig = this.config['pilot' + dialogName + 'Config'];
                    CUI.rte.Utils.applyDefaults(dialogConfig.dialogProperties, addDialogConfig);
                }
                CUI.rte.Utils.applyDefaults(dialogConfig, this.config['pilot' + dialogName + 'Config'] || {});
                dialogHelper.configure(dialogConfig);
                var dialogClass = this[dialogClassName]();
                if (dialogClass) {
                    dialogHelper.registerDialog(dialogClass);
                }
                this[dialogName] = dialogHelper.create();
                dialogHelper.calculateInitialPosition();
            }
            dm.show(this[dialogName]);
        },
        modifyContentCreation: function(context) {
            this.showDialog('contentCreationDialog', CONTENT_CREATION, 'getContentCreationDialogClass');
        },
        modifyContentTranslation: function(context) {
            var dm = this.editorKernel.getDialogManager();
            this.showDialog('contentTranslationDialog', CONTENT_TRANSLATION, 'getTranslationDialogClass');
        },
        modifyContentTone: function(context) {
            var dm = this.editorKernel.getDialogManager();
            this.showDialog('contentToneDialog', CONTENT_TONE, 'getToneDialogClass');
        },
        getContentReview: function(context) {
            var dm = this.editorKernel.getDialogManager();
            this.showDialog('contentReviewDialog', CONTENT_REVIEW, 'getReviewDialogClass');
        },
        getContentSummarization: function(context) {
            var dm = this.editorKernel.getDialogManager();
            this.showDialog('contentSummarizationDialog', CONTENT_SUMMARIZATION, 'getSummarizationDialogClass');
        },
        getContentElaboration: function(context) {
            var dm = this.editorKernel.getDialogManager();
            this.showDialog('contentElaborationDialog', CONTENT_ELABORATION, 'getElaborationDialogClass');
        },
        getContentAudience: function(context) {
            var dm = this.editorKernel.getDialogManager();
            this.showDialog('contentAudienceDialog', CONTENT_AUDIENCE, 'getAudienceDialogClass');
        },
                        
        initializeUI: function (tbGenerator) {
            var features = [
                { name: CONTENT_CREATION, title: CONTENT_CREATION_TITLE, icon: CREATION_ICON, sort: 10, uiElement: this.contentCreationUI },
                { name: CONTENT_TRANSLATION, title: CONTENT_TRANSLATION_TITLE, icon: TRANSLATION_ICON, sort: 20, uiElement: this.contentTranslationUI },
                { name: CONTENT_TONE, title: CONTENT_TONE_TILE, icon: TONE_ICON, sort: 30, uiElement: this.contentToneUI },
                { name: CONTENT_REVIEW, title: CONTENT_REVIEW_TITLE, icon: REVIEW_ICON, sort: 40, uiElement: this.contentReviewUI },
                { name: CONTENT_SUMMARIZATION, title: CONTENT_SUMMARIZATION_TITLE, icon: SUMMARIZATION_ICON, sort: 50, uiElement: this.contentSummarizationUI },
                { name: CONTENT_ELABORATION, title: CONTENT_ELABORATION_TITLE, icon: ELABORATION_ICON, sort: 60, uiElement: this.contentElaborationUI },
                { name: CONTENT_AUDIENCE, title: CONTENT_AUDIENCE_TITLE, icon: AUDIENCE_ICON, sort: 70, uiElement: this.contentAudienceUI }
            ];

            features.forEach(function (feature) {
                if (this.isFeatureEnabled(feature.name)) {
                    var uiElement = tbGenerator.createElement(feature.name, this, false, {
                        'title': Granite.I18n.get(feature.title)
                    });
                    tbGenerator.addElement(PLUGIN_NAME, CUI.rte.plugins.Plugin.SORT_FORMAT, uiElement, feature.sort);
                    tbGenerator.registerIcon(`${PLUGIN_NAME}#${feature.name}`, feature.icon);
                    this['${feature.uiElement}'] = uiElement;
                }
            }, this);
        },
        
        getContentCreationDialogClass: function() {
            return CUI.rte.ui.cui.ContentCreationDialog;
        },

        getTranslationDialogClass: function() {
            return CUI.rte.ui.cui.ContentTranslationDialog;
        },
        getToneDialogClass: function() {
            return CUI.rte.ui.cui.ContentToneDialog;
        },
        getReviewDialogClass: function() {
            return CUI.rte.ui.cui.ContentReviewDialog;
        },
        getSummarizationDialogClass: function() {
            return CUI.rte.ui.cui.ContentSummarizationDialog;
        },
        getElaborationDialogClass: function() {
            return CUI.rte.ui.cui.ContentElaborationDialog;
        },
        getAudienceDialogClass: function() {
            return CUI.rte.ui.cui.ContentAudienceDialog;
        },
       
        updateState: function (selectionDef) {
            const disabled = !selectionDef.isSelection;

            if (this.contentCreationUI) {
                this.contentCreationUI.setDisabled(disabled);
            }
            if (this.contentTranslationUI) {
                this.contentTranslationUI.setDisabled(disabled);
            }
            if (this.contentToneUI) {
                this.contentToneUI.setDisabled(disabled);
            }
            if (this.contentReviewUI) {
                this.contentReviewUI.setDisabled(disabled);
            }
            if (this.contentSummarizationUI) {
                this.contentSummarizationUI.setDisabled(disabled);
            }
            if (this.contentElaborationUI) {
                this.contentElaborationUI.setDisabled(disabled);
            }
            if (this.contentAudienceUI) {
                this.contentAudienceUI.setDisabled(disabled);
            }
        },

        getConfig: function () {
            return this.config;
        },
        execute: function (pluginCommand, value, env) {
            if (pluginCommand === CONTENT_CREATION) {
                //this.doRequest(this.requestContentCreation);
                this.modifyContentCreation(env.editContext);
            }else if(pluginCommand === CONTENT_TRANSLATION){
                this.modifyContentTranslation(env.editContext);
            } else if (pluginCommand === CONTENT_TONE) {
                this.modifyContentTone(env.editContext);
            }
            else if (pluginCommand === CONTENT_REVIEW) {
                this.getContentReview(env.editContext);
            }
            else if (pluginCommand === CONTENT_SUMMARIZATION) {
                this.getContentSummarization(env.editContext);
            }
            else if (pluginCommand === CONTENT_ELABORATION) {
                this.getContentElaboration(env.editContext);
            }
            else if (pluginCommand === CONTENT_AUDIENCE) {
                this.getContentAudience(env.editContext);
            }
            else {
                this.editorKernel.relayCmd(pluginCommand);
            }
        },       
    });

    CUI.rte.plugins.PluginRegistry.register(PLUGIN_NAME, CUI.rte.plugins.PilotAIPlugin);
})(window.jQuery, window.CUI);