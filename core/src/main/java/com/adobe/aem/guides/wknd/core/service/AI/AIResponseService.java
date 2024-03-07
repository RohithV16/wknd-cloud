package com.adobe.aem.guides.wknd.core.service.AI;

import java.io.IOException;

@FunctionalInterface
public interface AIResponseService {
    String getResponse(String body) throws IOException;
}
