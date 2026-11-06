ALTER TABLE "SiteSettings"
ADD CONSTRAINT "SiteSettings_singleton_check"
CHECK (id = 'main');
