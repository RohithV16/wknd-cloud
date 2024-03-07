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
(function($, CUI) {
    const AEM_ENDPOINT = '/bin/getAiResponse.json';
    const OPENAI_TIMEOUT = 1000;

    CUI.rte.ui.cui.ContentElaborationDialog = new Class({

        extend: CUI.rte.ui.cui.AbstractBaseDialog,

        toString: "ContentElaborationDialog",

        $idField: null,

        $removeButton: null,

        $removeColumn: null,

        selectionDef: null,

        id: null,

        getDataType: function() {
            return "contentElaboration";
        },
    // Construct the Dialog and Register with RTE Editor ---------------------
    construct: function() {
        var self = this;
        this.fields = {};
        Coral.templates.RichTextEditor["dlg_" + this.getDataType()] = function (config) {
            return self.buildDialog(config);
        };
    },
    buildDialog: function(config) {
        var frag = document.createDocumentFragment();
        return frag;
    },
    
    requestContentElaboration: function (prompt) {
        let contentElaboration = "";
        
        $.ajax({
            'url': AEM_ENDPOINT,
            'method': 'GET',
            'timeout': OPENAI_TIMEOUT,
            'cache': false,
            'async': false,
            'data': JSON.stringify({     
                'api': 'contentelaboration',               
                'prompt': encodeURIComponent(prompt),
            })
        }).done(function (response) {
            contentElaboration=response;
        }).fail(function (response) {
            console.error(`Error requesting for completions: ${response.responseText}`);
        });

        return contentElaboration;
    },
    getElaborationRequest: function (requestFn) {
        let elaboration="";
        if (!this.selectionDef .isSelection) {
            return;
        }

        const selection = this.selectionDef .selection;
        const startNode = selection.startNode;

        if (!startNode || startNode.nodeType !== Node.TEXT_NODE) {
            return;
        }

        const selectionParts = this.splitSelection(startNode.nodeValue, selection.startOffset, selection.endOffset);

        try {
            selectionParts[1] = requestFn(selectionParts[1]);
        } catch (exception) {
            console.error(`Error requesting data: ${exception.message}`);
        }

        startNode.nodeValue = selectionParts.join('');
    },

    splitSelection: function (selectionText, startOffset, endOffset) {
        const result = [];
        result.push(selectionText.substring(0, startOffset));
        result.push(selectionText.substring(startOffset, endOffset));
        result.push(selectionText.substring(endOffset));
        return result;
    },
    initialize: function(config) {
            this.config = config;
        this.context = this.editorKernel.getEditContext();
        this.touchScrollLimiter = this.context.getState('CUI.touchScrollLimiter');
        // Cancel all keydown events
        this.$dialog.on('keydown', this.handleKeyDown);
        },
        onHide: function() {
            if (this.touchScrollLimiter) {
                this.touchScrollLimiter.reactivate();
            }
        },
        handleKeyDown: function (event) {
            event.stopPropagation();
        },
    onShow: function() {
            const editContext =this.editorKernel.getEditContext();
            this.selectionDef = this.editorKernel.analyzeSelection(editContext);  
            this.getElaborationRequest(this.requestContentElaboration);
            if (!CUI.rte.Common.ua.isTouch) {
                var self = this;
                window.setTimeout(function() {
                    $(self.hrefField).focus();
                }, 1);
            }
        }

    });

})(window.jQuery, window.CUI);