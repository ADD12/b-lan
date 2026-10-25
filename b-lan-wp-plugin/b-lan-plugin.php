<?php
/**
 * Plugin Name: B-LAN Mesh Connector
 * Plugin URI: https://github.com/ADD12/b-lan
 * Description: Connect your WordPress site to the B-LAN Local-First Sharded Mesh Network. Hardened against AI-driven php2shell exploits with strict PHP 8.3.13+ runtime enforcement.
 * Version: 3.2.1
 * Requires at least: 6.4
 * Requires PHP: 8.3.13
 * Author: B-LAN Core Development
 * Author URI: https://github.com/ADD12/b-lan
 * License: GPLv2 or later
 * Text Domain: b-lan-plugin
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define Core Plugin Constants.
define( 'BLAN_PLUGIN_VERSION', '3.2.1' );
define( 'BLAN_MIN_PHP_VERSION', '8.3.13' );
define( 'BLAN_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BLAN_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Early Runtime PHP Version Guard
 * Strictly enforces PHP 8.3.13+ to defend against AI-generated php2shell injections.
 */
if ( version_compare( PHP_VERSION, BLAN_MIN_PHP_VERSION, '<' ) ) {
    add_action( 'admin_notices', 'blan_php_version_incompatible_notice' );
    function blan_php_version_incompatible_notice() {
        ?>
        <div class="notice notice-error is-dismissible">
            <p><strong><?php esc_html_e( 'B-LAN Security Warning:', 'b-lan-plugin' ); ?></strong> 
            <?php printf( 
                esc_html__( 'B-LAN Mesh Connector requires PHP %1$s or higher (Detected: %2$s) to defend against AI php2shell exploit payloads. Plugin execution is paused for site safety.', 'b-lan-plugin' ), 
                BLAN_MIN_PHP_VERSION, 
                esc_html( PHP_VERSION ) 
            ); ?>
            </p>
        </div>
        <?php
    }
    // Halt further plugin execution on insecure PHP runtimes
    return;
}

// Load AI PHP2Shell Defense Shield Module
require_once BLAN_PLUGIN_DIR . 'includes/security-shield.php';

/**
 * Helper to get a page by slug reliably without deprecation warnings.
 */
function blan_get_page_by_slug( $slug ) {
    $pages = get_posts( array(
        'name'           => $slug,
        'post_type'      => 'page',
        'post_status'    => array( 'publish', 'draft', 'private', 'pending' ),
        'posts_per_page' => 1,
        'suppress_filters' => true
    ) );
    return ! empty( $pages ) ? $pages[0] : null;
}

/**
 * Get definition list of all B-LAN auto-managed mesh pages.
 */
function blan_get_mesh_pages_definitions() {
    return array(
        'blan-signup' => array(
            'slug'        => 'blan-signup',
            'title'       => 'B-LAN Lite Sign-Up',
            'shortcode'   => '[blan_signup]',
            'description' => 'Lightweight citizen registration portal to join the B-LAN neighborhood mesh network.'
        ),
        'blan-profile' => array(
            'slug'        => 'blan-profile',
            'title'       => 'B-LAN Profile Dashboard',
            'shortcode'   => '[blan_member_profile]',
            'description' => 'Citizen Peer Identity Module (PIM) card showing verified skills and Karma balance.'
        ),
        'blan-directory' => array(
            'slug'        => 'blan-directory',
            'title'       => 'B-LAN Community Directory',
            'shortcode'   => '[blan_community_directory]',
            'description' => 'Community directory catalog listing all active neighborhood peers on the local CIM ledger.'
        ),
    );
}

/**
 * Ensures all required B-LAN mesh pages exist and are published.
 * 
 * @return array List of actions taken (created or updated pages)
 */
function blan_ensure_plugin_pages() {
    $definitions = blan_get_mesh_pages_definitions();
    $report = array();

    foreach ( $definitions as $slug => $def ) {
        $existing = blan_get_page_by_slug( $slug );
        if ( ! $existing ) {
            $post_id = wp_insert_post( array(
                'post_title'     => $def['title'],
                'post_name'      => $def['slug'],
                'post_content'   => $def['shortcode'],
                'post_status'    => 'publish',
                'post_type'      => 'page',
                'comment_status' => 'closed',
                'ping_status'    => 'closed',
            ) );
            if ( $post_id && ! is_wp_error( $post_id ) ) {
                $report[] = array(
                    'slug'   => $slug,
                    'status' => 'created',
                    'id'     => $post_id,
                    'title'  => $def['title']
                );
            }
        } else {
            // If page exists but was set to draft or trash, re-publish it
            if ( $existing->post_status !== 'publish' ) {
                wp_update_post( array(
                    'ID'          => $existing->ID,
                    'post_status' => 'publish'
                ) );
            }
            $report[] = array(
                'slug'   => $slug,
                'status' => 'exists',
                'id'     => $existing->ID,
                'title'  => $existing->post_title
            );
        }
    }

    return $report;
}

/**
 * Activation Hook: Automatically create B-LAN Member Pages and verify security constraints.
 */
register_activation_hook( __FILE__, 'blan_plugin_activate' );
function blan_plugin_activate() {
    // 1. Strict PHP version verification at activation time
    if ( version_compare( PHP_VERSION, BLAN_MIN_PHP_VERSION, '<' ) ) {
        deactivate_plugins( plugin_basename( __FILE__ ) );
        wp_die(
            sprintf(
                '<h1>%s</h1><p>%s</p><p>%s <strong>%s</strong>. %s <strong>%s</strong>.</p>',
                esc_html__( 'Security Requirement Unmet', 'b-lan-plugin' ),
                esc_html__( 'B-LAN Mesh Connector requires PHP 8.3.13 or higher to prevent remote execution via modern AI php2shell script injections.', 'b-lan-plugin' ),
                esc_html__( 'Required:', 'b-lan-plugin' ),
                esc_html( BLAN_MIN_PHP_VERSION ),
                esc_html__( 'Detected server version:', 'b-lan-plugin' ),
                esc_html( PHP_VERSION )
            ),
            esc_html__( 'B-LAN Mesh Security Exception', 'b-lan-plugin' ),
            array( 'back_link' => true )
        );
    }

    // 2. Save default settings if not exists
    if ( ! get_option( 'blan_node_url' ) ) {
        update_option( 'blan_node_url', 'http://localhost:3000' );
    }
    if ( ! get_option( 'blan_community_id' ) ) {
        update_option( 'blan_community_id', 'CIM-99' );
    }
    if ( ! get_option( 'blan_shard_license' ) ) {
        update_option( 'blan_shard_license', 'FREE-COMMUNITY-SHARD' );
    }

    // 3. Auto-create all 3 B-LAN pages (Lite Sign-Up, Member Profile, Community Directory)
    blan_ensure_plugin_pages();
}

/**
 * Enqueue Frontend Styles and Scripts
 */
add_action( 'wp_enqueue_scripts', 'blan_plugin_enqueue_scripts' );
function blan_plugin_enqueue_scripts() {
    wp_enqueue_style( 'blan-font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', array(), '6.4.0' );
    wp_enqueue_style( 'blan-plugin-style', BLAN_PLUGIN_URL . 'assets/css/style.css', array(), BLAN_PLUGIN_VERSION );
    wp_enqueue_script( 'blan-plugin-script', BLAN_PLUGIN_URL . 'assets/js/script.js', array( 'jquery' ), BLAN_PLUGIN_VERSION, true );

    // Localize settings for frontend script with strict URL sanitization
    wp_localize_script( 'blan-plugin-script', 'blanSettings', array(
        'nodeUrl'      => blan_sanitize_node_url( get_option( 'blan_node_url', 'http://localhost:3000' ) ),
        'communityId'  => sanitize_text_field( get_option( 'blan_community_id', 'CIM-99' ) ),
        'profileUrl'   => esc_url( home_url( '/blan-profile/' ) ),
        'directoryUrl' => esc_url( home_url( '/blan-directory/' ) ),
        'signupUrl'    => esc_url( home_url( '/blan-signup/' ) )
    ) );
}

/**
 * Load Admin Settings and Menu Hierarchy
 */
if ( is_admin() ) {
    require_once BLAN_PLUGIN_DIR . 'includes/admin-settings.php';
}

/**
 * Shortcode: [blan_signup] or [blan_lite_signup]
 * Renders lightweight citizen registration portal for the B-LAN local mesh
 */
add_shortcode( 'blan_signup', 'blan_render_lite_signup' );
add_shortcode( 'blan_lite_signup', 'blan_render_lite_signup' );
function blan_render_lite_signup( $atts ) {
    $atts = shortcode_atts( array(
        'title'        => 'Join the Neighborhood Mesh',
        'community_id' => get_option( 'blan_community_id', 'CIM-99' )
    ), $atts, 'blan_signup' );

    ob_start();
    ?>
    <div id="blan-signup-root" class="blan-widget-container" data-community="<?php echo esc_attr( $atts['community_id'] ); ?>">
        <div class="blan-card blan-signup-card">
            <div class="blan-signup-header">
                <div class="blan-badge-chip">
                    <i class="fa-solid fa-tower-broadcast"></i> Mesh Node: <?php echo esc_html( $atts['community_id'] ); ?>
                </div>
                <h3 class="blan-signup-title"><?php echo esc_html( $atts['title'] ); ?></h3>
                <p class="blan-signup-subtitle">Register your local Peer Identity Module (PIM) shard to participate in neighborhood energy sharing and peer trust.</p>
            </div>

            <form id="blan-lite-signup-form" class="blan-form-grid">
                <div class="blan-form-group">
                    <label for="blan_reg_name" class="blan-label">Citizen Name or Mesh Alias *</label>
                    <input type="text" id="blan_reg_name" name="name" class="blan-input" placeholder="e.g. Sarah Connor or Peer-42" required autocomplete="name" />
                </div>

                <div class="blan-form-group">
                    <label for="blan_reg_sector" class="blan-label">Physical Mesh Unit / Sector *</label>
                    <select id="blan_reg_sector" name="sector" class="blan-select" required>
                        <option value="Sector A - Downtown Gateway">Sector A - Downtown Gateway</option>
                        <option value="Sector B-4 - Residential Ridge" selected>Sector B-4 - Residential Ridge</option>
                        <option value="Sector C - Solar Co-op Microgrid">Sector C - Solar Co-op Microgrid</option>
                        <option value="Sector D - Community Market & Radio">Sector D - Community Market & Radio</option>
                    </select>
                </div>

                <div class="blan-form-group">
                    <label for="blan_reg_skill" class="blan-label">Primary PIM Skill Contribution</label>
                    <select id="blan_reg_skill" name="skill" class="blan-select">
                        <option value="Solar Maintenance">Solar Maintenance & Battery Prep</option>
                        <option value="SDR Radio Setup">SDR LoRa / Radio Communications</option>
                        <option value="General Labor">Community Help & General Labor</option>
                        <option value="Gardening & Food Co-op">Gardening & Food Co-op</option>
                        <option value="Emergency First Aid">Emergency First Aid & Health</option>
                        <option value="Mesh Relay Host">Mesh Relay Host & Hardware</option>
                    </select>
                </div>

                <div class="blan-form-group">
                    <label for="blan_reg_solar" class="blan-label">Initial Solar Reserve Contribution (Wh)</label>
                    <input type="number" id="blan_reg_solar" name="solarWatts" class="blan-input" placeholder="e.g. 500" value="500" min="0" max="50000" />
                    <span class="blan-help-text">Optional reserve energy to pledge to the neighborhood microgrid.</span>
                </div>

                <div class="blan-form-actions">
                    <button type="submit" id="blan-signup-btn" class="blan-btn blan-btn-primary">
                        <i class="fa-solid fa-id-card"></i> Mint PIM Identity & Join Mesh
                    </button>
                </div>
            </form>

            <div id="blan-signup-success" class="blan-success-box" style="display: none;">
                <!-- Populated dynamically upon sign-up -->
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Shortcode: [blan_member_profile]
 * Renders citizen passport view synchronized with B-LAN
 */
add_shortcode( 'blan_member_profile', 'blan_render_member_profile' );
function blan_render_member_profile( $atts ) {
    ob_start();
    ?>
    <div id="blan-profile-root" class="blan-widget-container">
        <div class="blan-card blan-loading">
            <div class="blan-spinner"></div>
            <p>Syncing with local B-LAN Node...</p>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Shortcode: [blan_community_directory]
 * Renders list of neighboring peers in the current Community Mesh
 */
add_shortcode( 'blan_community_directory', 'blan_render_community_directory' );
function blan_render_community_directory( $atts ) {
    ob_start();
    ?>
    <div id="blan-directory-root" class="blan-widget-container">
        <div class="blan-card blan-loading">
            <div class="blan-spinner"></div>
            <p>Scanning community mesh shards...</p>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
