/**
 * Copyright (c) 2012 Infosys Limited, Bangalore, India. All rights reserved.
 * Except for any free or open source software components embedded in this Infosys proprietary software program ("Program"),
 * this program is protected by copyright laws, international treatise and other pending or existing intellectual property rights
 * in India, the United States and other countries. Except as expressly permitted, any unauthorized reproduction, storage, transmission
 * in any form or by any means (including without limitation electronic, mechanical, printing, photocopying, recording or otherwise), or any
 * distribution of this Program, or any portion of it, may result in severe civil and criminal penalities, and will be prosecuted to the maximum
 * extent possible under the law.
 */
package com.adobe.aem.guides.wknd.core.service.AI;


import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(
        name = "Pilot AI Configuration",
        description = "This configuration captures the details of AI API"
)
public @interface PilotAIConfiguration {
    @AttributeDefinition(name = "API URL", description = "API URL")
    String getApiUrl() default "https://api.openai.com/v1/chat/completions";

    @AttributeDefinition(name = "Authorization Token", description = "Authorization Token.")
    String getAuthorizationToken() default "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";

    @AttributeDefinition(name = "AuthorizationType", description = "AuthorizationType")
    String getAuthorizationType() default "Bearer";

}
