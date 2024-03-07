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

    CUI.rte.ui.cui.ContentCreationDialog = new Class({

        extend: CUI.rte.ui.cui.AbstractBaseDialog,

        toString: "ContentCreationDialog",

        $idField: null,

        $removeButton: null,

        $removeColumn: null,

        selectionDef: null,

        id: null,

        getDataType: function () {
            return "contentCreation";
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
            // Word Limit TextField
            var frag = document.createDocumentFragment();
            frag.appendChild(this.createColumnItem({
                name: "wordLimitLabel",
                fn: this.createLabelField,
                label: "Word Limit of Content is (default 30) :",
            }));
            frag.appendChild(this.createColumnItem({
                name: "wordLimit",
                fn: this.createTextField,
                dataType: "wordLimitType",
                class: 'rte-custom-word-limit',
                placeholder: "30",
            }));
            // Source of Information  TextField
            frag.appendChild(this.createColumnItem({
                name: "srcInfoLabel",
                fn: this.createLabelField,
                label: "Add url for content refrence :",
            }));
            frag.appendChild(this.createColumnItem({
                name: "srcInfo",
                fn: this.createTextField,
                dataType: "srcInfoType",
                class: 'rte-custom-src-info',
                placeholder: "Source of Information"
            }));
            // Field Select Dropdown
            frag.appendChild(this.createColumnItem({
                name: "langugageLabel",
                fn: this.createLabelField,
                label: "Select content langugae(default is English) :",
            }));
            frag.appendChild(this.createColumnItem({
                name: "langugage",
                fn: this.createSelectDropdown,
                dataType: "languageType",
                class: 'rte-custom-field-select',
                options: [
                    {
                        value: 'English',
                        text: 'Select Language',
                        selected: true
                    },
                    {
                        value: 'English',
                        text: 'English'
                    },
                    {
                        value: 'Dutch',
                        text: 'Dutch'
                    },
                    {
                        value: 'Spanish',
                        text: 'Spanish'
                    },
                    {
                        value: 'Hindi',
                        text: 'Hindi'
                    }],
                placeholder: "Content Language"
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

            frag.appendChild(this.createButton({
                icon: "check",
                label: "dialog.apply",
                dataType: "apply",
                variant: "primary"
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
            if (buttonConfig.dataType === 'apply') {
                button.addEventListener("click", () => {
                    // Handle button click
                    this.doRequest(this.requestContentCreation);
                });
            }
            return button;
        },
        createSelectDropdown: function (selectConfig) {
            var select = document.createElement("coral-select");
            select.setAttribute("name", selectConfig.name);
            select.setAttribute("data-type", selectConfig.dataType);
            select.setAttribute("placeholder", CUI.rte.Utils.i18n(selectConfig.placeholder));
            var classAttributeValue = select.getAttribute('class');
            select.setAttribute("class", classAttributeValue + " " + selectConfig.class);
            // create options
            if (selectConfig.options) {
                selectConfig.options.forEach(function (optionConfig) {
                    var option = document.createElement("coral-select-item");
                    option.textContent = optionConfig.text;
                    option.value = optionConfig.value;
                    option.selected = optionConfig.selected;
                    select.appendChild(option);
                });
            }
            return select;
        },
        createLabelField: function (labelConfig) {
            var labelField = document.createElement("label");
            labelField.innerText = labelConfig.label;
            return labelField;
        },
        requestContentCreation: function (prompt) {
            let result = prompt;
            var wordLimit = document.querySelector("input[name='wordLimit']").value;
            var srcInfo = document.querySelector("input[name='srcInfo']").value;
            var language = document.querySelector("coral-select[data-type='languageType']").value;

            $.ajax({
                'url': AEM_ENDPOINT,
                'method': 'GET',
                'timeout': OPENAI_TIMEOUT,
                'cache': false,
                'async': false,
                'data': JSON.stringify({
                    'api': 'contentcreation',
                    'prompt': encodeURIComponent(prompt),
                    'wordLimit': wordLimit,
                    'srcInfo': srcInfo,
                    'language': language
                })
            }).done(function (response) {
                result = response;
            }).fail(function (response) {
                console.error(`Error requesting for completions: ${response.responseText}`);
            });

            return result;
        },
        doRequest: function (requestFn) {
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
        createTextField: function (textConfig) {
            var textField = document.createElement("input", "coral-textfield");
            textField.setAttribute("name", textConfig.name);
            textField.setAttribute("data-type", textConfig.dataType);

            textField.setAttribute("placeholder", CUI.rte.Utils.i18n(textConfig.placeholder));

            //class attribute
            var classAttributeValue = textField.getAttribute('class');
            textField.setAttribute("class", classAttributeValue + " " + textConfig.class);

            return textField;
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

            let srcInfoTypeField = document.querySelector("input[name='srcInfo']");
            if (srcInfoTypeField) {
                srcInfoTypeField.value = '';
            }

            let wordLimitTypeField = document.querySelector("input[name='wordLimit']");
            if (wordLimitTypeField) {
                wordLimitTypeField.value = '';
            }

            let languageTypeField = document.querySelector("coral-select[data-type='languageType']");
            if (languageTypeField) {
                languageTypeField.value = '';
            }
        },
        handleKeyDown: function (event) {
            event.stopPropagation();
        },
        onShow: function () {
            const editContext = this.editorKernel.getEditContext();
            this.selectionDef = this.editorKernel.analyzeSelection(editContext);
            if (!CUI.rte.Common.ua.isTouch) {
                var self = this;
                window.setTimeout(function () {
                    $(self.hrefField).focus();
                }, 1);
            }
        }

    });

})(window.jQuery, window.CUI);