// Utility functions for creating SEO-friendly URLs

/**
 * Creates a SEO-friendly slug from title and company/organization (without ID)
 * @param {string} title - The job/event/internship title
 * @param {string} organization - Company/organization name
 * @returns {string} - SEO-friendly slug
 */
export const createSEOSlug = (title, organization) => {
    if (!title || !organization) {
        return '';
    }

    const cleanString = (str) => {
        return str.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            .trim();
    };

    const titleSlug = cleanString(title);
    const orgSlug = cleanString(organization);
    
    return `${titleSlug}-${orgSlug}`;
};

/**
 * Creates a SEO-friendly slug with ID fallback for uniqueness
 * @param {string} title - The job/event/internship title
 * @param {string} organization - Company/organization name
 * @param {string|number} id - The unique ID
 * @returns {string} - SEO-friendly slug
 */
export const createSEOSlugWithId = (title, organization, id) => {
    if (!title || !organization || !id) {
        return id?.toString() || '';
    }

    const cleanString = (str) => {
        return str.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            .trim();
    };

    const titleSlug = cleanString(title);
    const orgSlug = cleanString(organization);
    
    return `${titleSlug}-${orgSlug}-${id}`;
};

/**
 * Extracts ID from SEO-friendly slug (for backward compatibility)
 * @param {string} slug - The SEO slug
 * @returns {string|null} - Extracted ID or null if not found
 */
export const extractIdFromSlug = (slug) => {
    if (!slug) return null;
    
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    
    // Check if last part is a UUID or number (for backward compatibility)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastPart) || /^\d+$/.test(lastPart)) {
        return lastPart;
    }
    
    return null;
};

/**
 * Extracts content info from slug for database lookup
 * @param {string} slug - The SEO slug
 * @returns {Object} - Object with title, organization, and id (if present)
 */
export const parseSlugForLookup = (slug) => {
    if (!slug) return { title: null, organization: null, id: null, slug: null };
    
    const parts = slug.split('-');
    
    // Check for UUID pattern in any part (more flexible for UUIDs)
    let idIndex = -1;
    let foundId = null;
    
    for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        // Check if this part looks like a UUID (NOT numeric ID - we use slug-based routing now)
        if (/^[0-9a-f]{8}$/.test(part) && i < parts.length - 4) {
            // Potential UUID start, check if next 4 parts form a complete UUID
            const potentialUuid = parts.slice(i, i + 5).join('-');
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(potentialUuid)) {
                foundId = potentialUuid;
                idIndex = i;
                break;
            }
        }
        // REMOVED: Numeric ID check - we now use slug-based routing only
    }
    
    if (foundId && idIndex >= 0) {
        // Old format with UUID - extract UUID and reconstruct slug without UUID
        const slugWithoutId = parts.slice(0, idIndex).join('-');
        return { 
            title: null, 
            organization: null, 
            id: foundId,
            slug: slugWithoutId,
            hasId: true
        };
    } else {
        // New format without ID - use full slug for lookup
        return { 
            title: null, 
            organization: null, 
            id: null,
            slug: slug,
            hasId: false
        };
    }
};

/**
 * Creates full URL path for job/event/internship details (without ID)
 * @param {string} type - 'jobs', 'events', or 'internships'
 * @param {string} title - The title
 * @param {string} organization - Company/organization name
 * @returns {string} - Full URL path
 */
export const createDetailsURL = (type, title, organization) => {
    const slug = createSEOSlug(title, organization);
    return `/event-detail/${type}/${slug}`;
};

/**
 * Creates full URL path with ID for backward compatibility
 * @param {string} type - 'jobs', 'events', or 'internships'
 * @param {string} title - The title
 * @param {string} organization - Company/organization name
 * @param {string|number} id - The unique ID
 * @returns {string} - Full URL path
 */
export const createDetailsURLWithId = (type, title, organization, id) => {
    const slug = createSEOSlugWithId(title, organization, id);
    return `/event-detail/${type}/${slug}`;
};

/**
 * Helper function to create SEO-friendly URL for jobs (without ID)
 * @param {Object} job - Job object with title and slug
 * @returns {string} - SEO-friendly URL
 */
export const createJobURL = (job) => {
    // Jobs use slug directly from database
    const slug = job.slug || createSEOSlug(job.title, job.company || job.companyName || 'Company');
    return `/event-detail/jobs/${slug}`;
};

/**
 * Helper function to create SEO-friendly URL for events (without ID)
 * @param {Object} event - Event object with title and slug
 * @returns {string} - SEO-friendly URL
 */
export const createEventURL = (event) => {
    // Events use slug directly from database (no organization in slug)
    const slug = event.slug || createSEOSlug(event.title, 'Event');
    return `/event-detail/events/${slug}`;
};

/**
 * Helper function to create SEO-friendly URL for ROAC Prime Talent Hub content (without ID)
 * @param {Object} content - Hub content object with title and slug
 * @returns {string} - SEO-friendly URL
 */
export const createHubContentURL = (content) => {
    // Hub content uses slug directly from database
    const slug = content.slug || createSEOSlug(content.title, 'ROAC Prime');
    return `/event-detail/internships/${slug}`;
};

/**
 * Legacy function for backward compatibility - converts old ID-based URLs to new slug format
 * @param {string} type - 'jobs', 'events', or 'internships'
 * @param {string|number} id - The ID
 * @param {Object} data - Data object containing title and organization info
 * @returns {string} - SEO-friendly URL
 */
export const convertLegacyURL = (type, id, data) => {
    if (!data) return `/event-detail/${type}/${id}`;
    
    const title = data.title || 'untitled';
    const organization = data.company || data.companyName || data.organization || data.organizer || 'organization';
    
    return createDetailsURL(type, title, organization, id);
};