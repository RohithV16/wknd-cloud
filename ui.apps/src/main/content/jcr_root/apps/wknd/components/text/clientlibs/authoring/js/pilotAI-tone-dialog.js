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

    CUI.rte.ui.cui.ContentToneDialog = new Class({

        extend: CUI.rte.ui.cui.AbstractBaseDialog,

        toString: "ContentToneDialog",

        $idField: null,

        $removeButton: null,

        $removeColumn: null,

        selectionDef: null,

        id: null,

        getDataType: function () {
            return "contentTone";
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
                name: "existingToneLabel",
                fn: this.createLabelField,
                label: "Tone of Selected Content:",
            }));

            frag.appendChild(this.createColumnItem({
                name: "existingTone",
                fn: this.createTextField,
                dataType: "existingToneType",
                class: 'rte-custom-src-info',
                placeholder: "Existing Tone of Content",
                label: "Existing Tone of Content",
                disabled: true
            }));
            frag.appendChild(this.createColumnItem({
                name: "targetToneLabel",
                fn: this.createLabelField,
                label: "Select different Tone of Content",
            }));
            // Field Select Dropdown
            frag.appendChild(this.createColumnItem({
                name: "targetTone",
                fn: this.createSelectDropdown,
                dataType: "targetToneType",
                class: 'rte-custom-field-select',
                options: [
                    {
                        value: 'Change Tone',
                        text: 'Change Tone',
                        selected: true
                    },
                    {
                        value: 'Professional',
                        text: 'Professional'
                    },
                    {
                        value: 'Confident',
                        text: 'Confident'
                    },
                    {
                        value: 'Elegant',
                        text: 'Elegant'
                    },
                    {
                        value: 'Empathetic',
                        text: 'Empathetic'
                    },
                    {
                        value: 'Friendly',
                        text: 'Friendly'
                    }],
                placeholder: "Target Content Tone"
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
                    this.doRequest(this.requestContentToneChange);
                });
            }
            return button;
        },
        requestContentToneChange: function (prompt) {
            let adjustedContent = "";
            var targetTone = document.querySelector("coral-select[data-type='targetToneType']").value;
            $.ajax({
                'url': AEM_ENDPOINT,
                'method': 'GET',
                'timeout': OPENAI_TIMEOUT,
                'cache': false,
                'async': false,
                'data': JSON.stringify({
                    'api': 'adjusttone',
                    'prompt': encodeURIComponent(prompt),
                    'tone': targetTone,
                })
            }).done(function (response) {
                adjustedContent = response;
            }).fail(function (response) {
                console.error(`Error requesting for completions: ${response.responseText}`);
            });

            return adjustedContent;
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
        requestContentTone: function (prompt) {
            let tone = "";

            $.ajax({
                'url': AEM_ENDPOINT,
                'method': 'GET',
                'timeout': OPENAI_TIMEOUT,
                'cache': false,
                'async': false,
                'data': JSON.stringify({
                    'api': 'gettone',
                    'prompt': encodeURIComponent(prompt),
                })
            }).done(function (response) {
                tone = response;
            }).fail(function (response) {
                console.error(`Error requesting for completions: ${response.responseText}`);
            });

            return tone;
        },
        getToneRequest: function (requestFn) {
            let tone = "";
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
                tone = requestFn(selectionParts[1]);
            } catch (exception) {
                console.error(`Error requesting data: ${exception.message}`);
            }

            return tone;
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
            if (textConfig.disabled) {
                textField.setAttribute("disabled", textConfig.disabled);
            }
            textField.setAttribute("placeholder", CUI.rte.Utils.i18n(textConfig.placeholder));
            //class attribute
            var classAttributeValue = textField.getAttribute('class');
            textField.setAttribute("class", classAttributeValue + " " + textConfig.class);

            return textField;
        },
        createLabelField: function (labelConfig) {
            var labelField = document.createElement("label");
            labelField.innerText = labelConfig.label;
            return labelField;
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
            let existingToneTypeField = document.querySelector("input[name='existingTone']");
            if (existingToneTypeField) {
                existingToneTypeField.value = '';
            }
            let targetToneTypeField = document.querySelector("coral-select[data-type='targetToneType']");
            if (targetToneTypeField) {
                targetToneTypeField.value = '';
            }
        },
        handleKeyDown: function (event) {
            event.stopPropagation();
        },
        onShow: function () {
            const editContext = this.editorKernel.getEditContext();
            this.selectionDef = this.editorKernel.analyzeSelection(editContext);
            var tone = document.querySelector("input[name='existingTone']");
            tone.value = this.getToneRequest(this.requestContentTone);
            if (!CUI.rte.Common.ua.isTouch) {
                var self = this;
                window.setTimeout(function () {
                    $(self.hrefField).focus();
                }, 1);
            }
        }

    });

})(window.jQuery, window.CUI);