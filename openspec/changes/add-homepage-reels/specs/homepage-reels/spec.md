## ADDED Requirements

### Requirement: Admin reel management
Authenticated administrators SHALL be able to create, edit, publish, unpublish, order and delete reel records. Records SHALL include a title, client name, platform, HTTPS source link, thumbnail, optional views/likes/comments, status and display order. Changes SHALL persist in MongoDB. Uploads SHALL use existing Cloudinary infrastructure.

#### Scenario: Publish a reel
- **WHEN** an administrator saves a valid reel with a thumbnail and published status
- **THEN** the record is saved and the homepage displays it in configured order
- **AND** edits and unpublishing are reflected on subsequent public requests

#### Scenario: Unauthorized mutation
- **WHEN** an unauthenticated visitor requests the admin page or any reel mutation
- **THEN** the existing admin access check blocks the operation before data access or uploads

#### Scenario: Invalid inputs
- **WHEN** an administrator submits unsafe URLs, invalid ordering, oversized or unsupported images, or publishes without a thumbnail
- **THEN** validation rejects the request with an actionable error and the form retains its entered values

### Requirement: Reel gallery below Results
The homepage SHALL place published reels directly beneath the existing landscape Results panel and before Case Studies. Cards SHALL show portrait thumbnails, client/title, platform, supplied metrics, and accessible original-post links. The Results layout and metric behavior SHALL remain unchanged.

#### Scenario: Watch a reel from any platform
- **WHEN** a visitor activates a thumbnail play control or View reel link
- **THEN** the original HTTPS post opens in a new tab with safe rel attributes
- **AND** the site does not require third-party embed scripts or platform-specific authentication

#### Scenario: Responsive and empty states
- **WHEN** the gallery is viewed at desktop, tablet or mobile widths
- **THEN** cards use four columns, two columns or a horizontally scrollable row respectively without document overflow
- **WHEN** no published reels exist or data is unavailable
- **THEN** the gallery is omitted and the rest of the homepage remains available
