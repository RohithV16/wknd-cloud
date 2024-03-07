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

    CUI.rte.ui.cui.ContentAudienceDialog = new Class({

        extend: CUI.rte.ui.cui.AbstractBaseDialog,

        toString: "ContentAudienceDialog",

        $idField: null,

        $removeButton: null,

        $removeColumn: null,

        selectionDef: null,

        id: null,

        getDataType: function () {
            return "contentAudience";
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
                name: "audienceLabel",
                fn: this.createLabelField,
                label: "Target Audience of Content is :",
            }));

            frag.appendChild(this.createColumnItem({
                name: "audience",
                fn: this.createMultiField,
                dataType: "audienceDataType",
                class: 'rte-custom-audience-field',
                placeholder: "Target audience of Content",
                label: "AI audience of Content",
                disabled: true,
                //style: "height: 107px; width: 107px"
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
                    this.modifyAudienceRequest(this.requestModifyAudience);
                });
            }
            return button;
        },
        createMultiField: function (multiFieldConfig) {
            var multiField = document.createElement("multifield", "coral-multifield");
            multiField.setAttribute("name", multiFieldConfig.name);
            multiField.setAttribute("data-type", multiFieldConfig.dataType);
            if (multiField.disabled) {
                multiField.setAttribute("disabled", multiFieldConfig.disabled);
            }
            if (multiField.style) {
                multiField.setAttribute("style", multiFieldConfig.style);
            }
            multiField.setAttribute("placeholder", CUI.rte.Utils.i18n(multiFieldConfig.placeholder));
            //class attribute
            var classAttributeValue = multiField.getAttribute('class');
            multiField.setAttribute("class", classAttributeValue + " " + multiFieldConfig.class);
            return multiField;

        },
        createLabelField: function (labelConfig) {
            var labelField = document.createElement("label");
            labelField.innerText = labelConfig.label;
            return labelField;
        },
        requestContentAudience: function (prompt) {
            let contentAudience = "";

            $.ajax({
                'url': AEM_ENDPOINT,
                'method': 'GET',
                'timeout': OPENAI_TIMEOUT,
                'cache': false,
                'async': false,
                'data': JSON.stringify({
                    'api': 'gettargetaudience',
                    'prompt': encodeURIComponent(prompt),
                })
            }).done(function (response) {
                contentAudience = response;
            }).fail(function (response) {
                console.error(`Error requesting for completions: ${response.responseText}`);
            });

            return contentAudience;
        },
        requestModifyAudience: function (prompt) {
            let contentSuggestion = prompt;
            const selectedAudience = Array.from(document.querySelectorAll("input[type='checkbox']:checked"));
            const targetAudience = selectedAudience.map(checkbox => checkbox.value).join(",");
            const valuesNotInTargetAudience = selectedAudience.filter(checkbox => !targetAudience.includes(checkbox.value));
            const valuesNotInTargetAudienceArray = valuesNotInTargetAudience.map(checkbox => checkbox.value).join(",");
            $.ajax({
                'url': AEM_ENDPOINT,
                'method': 'GET',
                'timeout': OPENAI_TIMEOUT,
                'cache': false,
                'async': false,
                'data': JSON.stringify({
                    'api': 'contentsuggestion',
                    'prompt': encodeURIComponent(prompt),
                    'targetaudience': targetAudience,
                    'notintargetaudience':valuesNotInTargetAudienceArray
                })
            }).done(function (response) {
                contentSuggestion = response;
            }).fail(function (response) {
                console.error(`Error requesting for completions: ${response.responseText}`);
            });

            return contentSuggestion;
        },
        getAudienceRequest: function (requestFn) {
            let audience = "";
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
                audience = requestFn(selectionParts[1]);
            } catch (exception) {
                console.error(`Error requesting data: ${exception.message}`);
            }

            return audience;
        },
        modifyAudienceRequest: function (requestFn) {
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
            let audienceTypeField = document.querySelector("coral-multifield[name='audience']");
            Array.from(audienceTypeField.children).forEach(function (item) {
                audienceTypeField.removeChild(item);
            });
        },
        handleKeyDown: function (event) {
            event.stopPropagation();
        },
        onShow: function () {
            const editContext = this.editorKernel.getEditContext();
            this.selectionDef = this.editorKernel.analyzeSelection(editContext);
            var audience = document.querySelector("coral-multifield[name='audience']");
            audience.value = this.getAudienceRequest(this.requestContentAudience);
            const array = audience.value.split(',');
            array.forEach(function (element, index) {
                var capitalizedElement = element.trim().charAt(0).toUpperCase() + element.trim().slice(1);
                var option = document.createElement("coral-checkbox");
                option.label.textContent = capitalizedElement;
                option.label.innerHTML = capitalizedElement;
                option.value = element.trim();
                if (index != 0) {
                    var breakElement = document.createElement("br");
                    audience.appendChild(breakElement);
                }
                audience.appendChild(option);
            });
            if (!CUI.rte.Common.ua.isTouch) {
                var self = this;
                window.setTimeout(function () {
                    $(self.hrefField).focus();
                }, 1);
            }
        }

    });

})(window.jQuery, window.CUI);