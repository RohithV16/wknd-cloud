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
    const AEM_ENDPOINT = '/bin/getAiResponse.json';
    const OPENAI_TIMEOUT = 1000;

    CUI.rte.ui.cui.ContentReviewDialog = new Class({

        extend: CUI.rte.ui.cui.AbstractBaseDialog,

        toString: "ContentReviewDialog",

        $idField: null,

        $removeButton: null,

        $removeColumn: null,

        selectionDef: null,

        id: null,

        getDataType: function () {
            return "contentReview";
        },
        // Construct the Dialog and Register with RTE Editor ---------------------
        construct: function () {
            var self = this;
            this.fields = {};
            Coral.templates.RichTextEditor["dlg_" + this.getDataType()] = function (config) {
                return self.buildDialog(config);
            };
        },
        buildDialog: function (config) {
            var frag = document.createDocumentFragment();
            frag.appendChild(this.createColumnItem({
                name: "reviewLabel",
                fn: this.createLabelField,
                label: "AI review of Content is :",
            }));

            frag.appendChild(this.createColumnItem({
                name: "review",
                fn: this.createTextArea,
                dataType: "reviewDataType",
                class: 'rte-custom-review-field',
                placeholder: "AI review of Content",
                label: "Content Feedback",
                disabled: true,
                style: "height: 214px; width: 401px"
            }));

            // button bar
            frag.appendChild(this.createColumnItem({
                fn: this.createButtonBar,
                columnClass: "rte-dialog-column--rightAligned"
            }));

            return frag;
        },

        createColumnItem: function (itemConfig) {
            if (!itemConfig.fn) {
                return;
            }
            // create wrapper divs - column container and container
            var columnContainer = document.createElement("div");
            columnContainer.className = "rte-dialog-columnContainer";

            var column = document.createElement("div");
            column.className = "rte-dialog-column";
            if (itemConfig.columnClass) {
                column.className += " " + itemConfig.columnClass;
            }
            columnContainer.appendChild(column);

            // create item
            var item = itemConfig.fn.apply(this, [itemConfig]);
            column.appendChild(item);

            // store reference to item in field of dialog object
            if (itemConfig.name) {
                this.fields[itemConfig.name] = item;
            }
            return columnContainer;
        },
        createButtonBar: function (config) {
            var frag = document.createDocumentFragment();

            frag.appendChild(this.createButton({
                icon: "close",
                label: "dialog.cancel",
                dataType: "cancel"
            }));
            return frag;
        },
        createButton: function (buttonConfig) {
            var button = document.createElement("button", "coral-button");
            button.setAttribute("is", "coral-button");
            button.setAttribute("icon", buttonConfig.icon);
            button.setAttribute("title", CUI.rte.Utils.i18n(buttonConfig.label));
            button.setAttribute("aria-label", buttonConfig.label);
            button.setAttribute("iconsize", "S");
            if (buttonConfig.variant) {
                button.setAttribute("variant", buttonConfig.variant);
            }
            button.setAttribute("type", "button");
            button.setAttribute("data-type", buttonConfig.dataType);
            button.setAttribute("tabindex", "-1");
            return button;
        },
        requestContentReview: function (prompt) {
            let review = "";

            $.ajax({
                'url': AEM_ENDPOINT,
                'method': 'GET',
                'timeout': OPENAI_TIMEOUT,
                'cache': false,
                'async': false,
                'data': JSON.stringify({
                    'api': 'review',
                    'prompt': encodeURIComponent(prompt),
                })
            }).done(function (response) {
                review = response;
            }).fail(function (response) {
                console.error(`Error requesting for completions: ${response.responseText}`);
            });

            return review;
        },

        getReviewRequest: function (requestFn) {
            let review = "";
            if (!this.selectionDef.isSelection) {
                return;
            }

            const selection = this.selectionDef.selection;
            const startNode = selection.startNode;

            if (!startNode || startNode.nodeType !== Node.TEXT_NODE) {
                return;
            }

            const selectionParts = this.splitSelection(startNode.nodeValue, selection.startOffset, selection.endOffset);

            try {
                review = requestFn(selectionParts[1]);
            } catch (exception) {
                console.error(`Error requesting data: ${exception.message}`);
            }

            return review;
        },

        splitSelection: function (selectionText, startOffset, endOffset) {
            const result = [];
            result.push(selectionText.substring(0, startOffset));
            result.push(selectionText.substring(startOffset, endOffset));
            result.push(selectionText.substring(endOffset));
            return result;
        },
        createTextArea: function (textConfig) {
            var textArea = document.createElement("textarea", "coral-textarea");
            textArea.setAttribute("name", textConfig.name);
            textArea.setAttribute("data-type", textConfig.dataType);
            if (textConfig.disabled) {
                textArea.setAttribute("disabled", textConfig.disabled);
            }
            if (textConfig.style) {
                textArea.setAttribute("style", textConfig.style);
            }
            textArea.setAttribute("placeholder", CUI.rte.Utils.i18n(textConfig.placeholder));
            //class attribute
            var classAttributeValue = textArea.getAttribute('class');
            textArea.setAttribute("class", classAttributeValue + " " + textConfig.class);

            return textArea;
        },
        createLabelField: function (labelConfig) {
            var labelField = document.createElement("label");
            labelField.innerText = labelConfig.label;
            return labelField;
        },
        initialize: function (config) {
            this.config = config;
            this.context = this.editorKernel.getEditContext();
            this.touchScrollLimiter = this.context.getState('CUI.touchScrollLimiter');
            // Cancel all keydown events
            this.$dialog.on('keydown', this.handleKeyDown);
        },
        onHide: function () {
            if (this.touchScrollLimiter) {
                this.touchScrollLimiter.reactivate();
            }
            let reviewTypeField = document.querySelector("textarea[name='review']");
            if (reviewTypeField) {
                reviewTypeField.value = '';
            }
        },
        handleKeyDown: function (event) {
            event.stopPropagation();
        },
        onShow: function () {
            const editContext = this.editorKernel.getEditContext();
            this.selectionDef = this.editorKernel.analyzeSelection(editContext);
            var review = document.querySelector("textarea[name='review']");
            review.value = this.getReviewRequest(this.requestContentReview);
            if (!CUI.rte.Common.ua.isTouch) {
                var self = this;
                window.setTimeout(function () {
                    $(self.hrefField).focus();
                }, 1);
            }
        }

    });

})(window.jQuery, window.CUI);