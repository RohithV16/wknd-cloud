/**
 *	Copyright (c) 2012 Infosys Limited, Bangalore, India. All rights reserved.
 *   Except for any free or open source software components embedded in this Infosys proprietary software program ("Program"),
 *   this program is protected by copyright laws, international treatise and other pending or existing intellectual property rights
 *   in India, the United States and other countries. Except as expressly permitted, any unauthorized reproduction, storage, transmission
 *   in any form or by any means (including without limitation electronic, mechanical, printing, photocopying, recording or otherwise), or any
 *    distribution of this Program, or any portion of it, may result in severe civil and criminal penalities, and will be prosecuted to the maximum
 *    extent possible under the law.
 */

package com.adobe.aem.guides.wknd.core.service.AI;

import org.osgi.framework.Constants;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.metatype.annotations.Designate;

@Component(
        service = PilotAIService.class,
        immediate = true,
        property = {
                Constants.SERVICE_ID + "=PilotAIService Service",
                Constants.SERVICE_DESCRIPTION + "= Service to read values from PilotAI Configuration"
        })
@Designate(ocd = PilotAIConfiguration.class)
public class PilotAIServiceImpl implements PilotAIService{
    private PilotAIConfiguration pilotAIConfiguration;
    @Activate
    @Modified
    protected void activate(PilotAIConfiguration pilotAIConfiguration) {
        this.pilotAIConfiguration = pilotAIConfiguration;
    }
    @Override
    public String getApiUrl() {
        return pilotAIConfiguration.getApiUrl();
    }

    @Override
    public String getAuthorizationToken() {
        return pilotAIConfiguration.getAuthorizationToken();
    }

    @Override
    public String getAuthorizationType() {
        return pilotAIConfiguration.getAuthorizationType();
    }

}
