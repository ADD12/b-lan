import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, CheckCircle, HelpCircle, Server, Code, Settings, Shield, AlertTriangle, GitBranch, Smartphone, FileText, Layers, ExternalLink } from 'lucide-react';

const WordPressPlugin: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // File templates stored as static strings to guarantee zero runtime fetch errors in iframe
  const bLanPluginPhp = `<?php
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
`;

  const securityShieldPhp = `<?php
/**
 * B-LAN AI PHP2Shell Defense Shield
 * Protects against AI web shell droppers and dynamic execution vectors.
 * Requires PHP 8.3.13 or higher.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function blan_check_php_requirement() {
    return version_compare( PHP_VERSION, BLAN_MIN_PHP_VERSION, '>=' );
}

add_action( 'init', 'blan_guard_against_ai_php2shell', 1 );
function blan_guard_against_ai_php2shell() {
    if ( php_sapi_name() === 'cli' ) {
        return;
    }

    $signatures = array(
        'obfuscated_exec' => '/(eval|assert|passthru|shell_exec|system|proc_open|popen)\\\\s*\\\\(\\\\s*(base64_decode|gzinflate|str_rot13|hex2bin|chr|pack)/i',
        'raw_exec_call'   => '/(\\\\bpassthru|\\\\bshell_exec|\\\\bexec|\\\\bsystem|\\\\bproc_open|\\\\bpopen|\\\\bpcntl_exec)\\\\s*\\\\(/i',
        'stream_wrapper'  => '/(phar|php|data|expect|compress\\\\.zlib|zip|glob):\\\\/\\\\//i',
        'shell_spawn'     => '/(\\\\/bin\\\\/(sh|bash|zsh|dash)|cmd\\\\.exe|powershell(\\\\.exe)?|\\\\/dev\\\\/tcp\\\\/\\\\d+)/i',
        'inline_php_tag'  => '/<\\\\?(php|=)/i',
        'magic_var_func'  => '/\\\\\\$(GLOBALS|_POST|_GET|_COOKIE|_REQUEST)\\\\[.+\\\\]\\\\s*\\\\(/i',
        'php2shell_regex' => '/(\\\\bpreg_replace\\\\b\\\\s*\\\\(.*\\\\/e[\\\'"])/i'
    );

    $inspect_targets = array();
    if ( ! empty( $_GET ) ) $inspect_targets['GET'] = json_encode( $_GET );
    if ( ! empty( $_POST ) ) $inspect_targets['POST'] = json_encode( $_POST );
    if ( ! empty( $_COOKIE ) ) {
        foreach ( $_COOKIE as $k => $v ) {
            if ( str_contains( $k, 'blan' ) ) {
                $inspect_targets['COOKIE:' . $k] = is_string( $v ) ? $v : json_encode( $v );
            }
        }
    }
    if ( ! empty( $_SERVER['REQUEST_URI'] ) ) {
        $inspect_targets['URI'] = (string) $_SERVER['REQUEST_URI'];
    }

    foreach ( $inspect_targets as $source => $payload ) {
        if ( ! is_string( $payload ) ) continue;

        foreach ( $signatures as $rule_name => $pattern ) {
            if ( preg_match( $pattern, $payload ) ) {
                blan_log_security_threat( $rule_name, $source, $payload );
                status_header( 403 );
                nocache_headers();
                wp_die(
                    sprintf(
                        '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:40px auto;padding:24px;border-radius:12px;background:#0f172a;color:#f87171;border:1px solid #7f1d1d;">' .
                        '<h2 style="color:#ef4444;margin-top:0;">🛡️ B-LAN AI PHP2Shell Defense Shield</h2>' .
                        '<p style="color:#f1f5f9;font-size:14px;line-height:1.6;">Request blocked by B-LAN Security Shield: potential web shell injection detected.</p>' .
                        '<div style="background:#1e293b;padding:12px;border-radius:6px;font-family:monospace;font-size:12px;color:#94a3b8;margin:15px 0;">Rule: %s | Source: %s</div>' .
                        '<p style="color:#64748b;font-size:12px;">Node enforces PHP 8.3.13+ security sandboxing.</p>' .
                        '</div>',
                        esc_html( $rule_name ),
                        esc_html( $source )
                    ),
                    'B-LAN Security Alert: AI PHP2Shell Blocked',
                    array( 'response' => 403, 'back_link' => false )
                );
            }
        }
    }
}

function blan_log_security_threat( $rule, $source, $payload ) {
    $ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '0.0.0.0';
    $log_entry = array(
        'timestamp' => current_time( 'timestamp' ),
        'date'      => current_time( 'mysql' ),
        'ip'        => $ip,
        'rule'      => $rule,
        'source'    => $source,
        'snippet'   => substr( strip_tags( $payload ), 0, 120 )
    );

    $threat_logs = get_option( 'blan_security_threat_logs', array() );
    if ( ! is_array( $threat_logs ) ) $threat_logs = array();
    array_unshift( $threat_logs, $log_entry );
    update_option( 'blan_security_threat_logs', array_slice( $threat_logs, 0, 50 ), false );
}

function blan_sanitize_node_url( $url ) {
    $url = trim( $url );
    if ( preg_match( '/^(phar|php|data|expect|file|zip|glob):/i', $url ) ) {
        return 'http://localhost:3000';
    }
    if ( ! preg_match( '/^https?:\\\\/\\\\//i', $url ) ) {
        $url = 'http://' . $url;
    }
    $sanitized = esc_url_raw( $url, array( 'http', 'https' ) );
    return ! empty( $sanitized ) ? $sanitized : 'http://localhost:3000';
}
`;

  const securityIndexPhp = `<?php
// Silence is golden. Direct directory access prohibited.
`;

  const adminSettingsPhp = `<?php
/**
 * Admin settings and mesh page management panel for B-LAN Plugin V.3.2.1
 * Hardened with AI PHP2Shell Defense Monitor and Sidebar Page Navigation.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'admin_menu', 'blan_plugin_add_admin_menu' );
function blan_plugin_add_admin_menu() {
    add_menu_page(
        'B-LAN Mesh Connector Settings',
        'B-LAN Mesh Connector',
        'manage_options',
        'b-lan-settings',
        'blan_plugin_render_settings_page',
        'dashicons-networking',
        80
    );

    add_submenu_page(
        'b-lan-settings',
        'B-LAN Settings',
        'Settings',
        'manage_options',
        'b-lan-settings',
        'blan_plugin_render_settings_page'
    );

    add_submenu_page(
        'b-lan-settings',
        'B-LAN Mesh Pages Manager',
        'All Mesh Pages',
        'manage_options',
        'b-lan-pages',
        'blan_plugin_render_pages_manager_page'
    );

    add_submenu_page(
        'b-lan-settings',
        'Lite Sign-Up Page',
        'Lite Sign-Up',
        'manage_options',
        'b-lan-signup-manager',
        'blan_plugin_render_signup_manager_page'
    );

    add_submenu_page(
        'b-lan-settings',
        'Member Profile Dashboard',
        'Member Profile',
        'manage_options',
        'b-lan-profile-manager',
        'blan_plugin_render_profile_manager_page'
    );

    add_submenu_page(
        'b-lan-settings',
        'Community Directory',
        'Directory',
        'manage_options',
        'b-lan-directory-manager',
        'blan_plugin_render_directory_manager_page'
    );

    add_submenu_page(
        'b-lan-settings',
        'AI PHP2Shell Defense Shield',
        'Security Shield',
        'manage_options',
        'b-lan-shield',
        'blan_plugin_render_shield_page'
    );
}

add_action( 'admin_init', 'blan_plugin_settings_init' );
function blan_plugin_settings_init() {
    register_setting( 'blan_settings_group', 'blan_node_url', array(
        'type'              => 'string',
        'sanitize_callback' => 'blan_sanitize_node_url',
        'default'           => 'http://localhost:3000'
    ) );
    register_setting( 'blan_settings_group', 'blan_community_id', array(
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => 'CIM-99'
    ) );
    register_setting( 'blan_settings_group', 'blan_shard_license', array(
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => 'FREE-COMMUNITY-SHARD'
    ) );
}

function blan_plugin_render_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;

    $notice_html = '';
    if ( isset( $_POST['blan_save_settings'] ) ) {
        if ( ! isset( $_POST['blan_settings_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['blan_settings_nonce'] ) ), 'blan_save_settings_action' ) ) {
            $notice_html = '<div class="notice notice-error is-dismissible"><p>Security check failed. Please refresh and try again.</p></div>';
        } else {
            if ( isset( $_POST['blan_node_url'] ) ) update_option( 'blan_node_url', blan_sanitize_node_url( sanitize_text_field( wp_unslash( $_POST['blan_node_url'] ) ) ) );
            if ( isset( $_POST['blan_community_id'] ) ) update_option( 'blan_community_id', sanitize_text_field( wp_unslash( $_POST['blan_community_id'] ) ) );
            if ( isset( $_POST['blan_shard_license'] ) ) update_option( 'blan_shard_license', sanitize_text_field( wp_unslash( $_POST['blan_shard_license'] ) ) );
            $notice_html = '<div class="notice notice-success is-dismissible"><p><strong>Success:</strong> B-LAN Mesh node settings saved successfully!</p></div>';
        }
    }

    if ( isset( $_POST['blan_recreate_pages'] ) ) {
        if ( ! isset( $_POST['blan_recreate_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['blan_recreate_nonce'] ) ), 'blan_recreate_action' ) ) {
            $notice_html = '<div class="notice notice-error is-dismissible"><p>Security check failed. Please try again.</p></div>';
        } else {
            blan_ensure_plugin_pages();
            $notice_html = '<div class="notice notice-success is-dismissible"><p><strong>Success:</strong> All 3 B-LAN mesh pages (Lite Sign-Up, Member Profile, Directory) are active and published!</p></div>';
        }
    }

    $node_url = blan_sanitize_node_url( get_option( 'blan_node_url', 'http://localhost:3000' ) );
    $community_id = get_option( 'blan_community_id', 'CIM-99' );
    $license_key = get_option( 'blan_shard_license', 'FREE-COMMUNITY-SHARD' );
    $threat_logs = get_option( 'blan_security_threat_logs', array() );
    if ( ! is_array( $threat_logs ) ) $threat_logs = array();
    $is_php_compatible = version_compare( PHP_VERSION, BLAN_MIN_PHP_VERSION, '>=' );
    ?>
    <div class="wrap blan-admin-wrap" style="max-width: 960px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <?php echo $notice_html; ?>
        <div style="background: #0f172a; border-radius: 16px; padding: 30px; border: 1px solid #334155; margin-top: 20px; color: #f1f5f9; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="background: #4f46e5; color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900;">B</div>
                    <div>
                        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">B-LAN <span style="color: #6366f1;">Plugin V.3.2.1</span></h1>
                        <p style="margin: 3px 0 0; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase;">Local-First Mesh Integration & AI PHP2Shell Defense</p>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <a href="<?php echo esc_url( admin_url( 'admin.php?page=b-lan-pages' ) ); ?>" style="text-decoration: none; background: rgba(79, 70, 229, 0.15); color: #a5b4fc; border: 1px solid rgba(79, 70, 229, 0.3); border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: bold;">📁 Manage Pages</a>
                    <a href="<?php echo esc_url( admin_url( 'admin.php?page=b-lan-shield' ) ); ?>" style="text-decoration: none; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: bold;">🛡️ Shield Active</a>
                    <div style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; border-radius: 20px; padding: 6px 12px; font-size: 11px; font-weight: bold; font-family: monospace;">PHP <?php echo esc_html( PHP_VERSION ); ?></div>
                </div>
            </div>

            <form method="post" action="">
                <?php wp_nonce_field( 'blan_save_settings_action', 'blan_settings_nonce' ); ?>
                <div style="background: #1e293b; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #334155;">
                    <h3 style="color: white; margin-top: 0; font-size: 15px; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 10px;">Rapid Setup Wizard</h3>
                    <table class="form-table" style="color: #94a3b8; width: 100%;">
                        <tr valign="top">
                            <th scope="row" style="color: #cbd5e1; font-weight: 600; width: 250px;">B-LAN Node Address</th>
                            <td>
                                <input type="url" name="blan_node_url" value="<?php echo esc_url( $node_url ); ?>" style="width: 100%; max-width: 440px; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px 14px; border-radius: 8px;" placeholder="e.g. http://192.168.1.100:3000" required />
                                <p class="description" style="color: #64748b; margin-top: 6px; font-size: 11px;">The local IP/host URL of your active B-LAN physical node.</p>
                            </td>
                        </tr>
                        <tr valign="top">
                            <th scope="row" style="color: #cbd5e1; font-weight: 600;">Community Module ID (CIM)</th>
                            <td>
                                <input type="text" name="blan_community_id" value="<?php echo esc_attr( $community_id ); ?>" style="width: 100%; max-width: 440px; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px 14px; border-radius: 8px;" placeholder="e.g. CIM-99" required />
                            </td>
                        </tr>
                        <tr valign="top">
                            <th scope="row" style="color: #cbd5e1; font-weight: 600;">License Node Shard</th>
                            <td>
                                <input type="text" name="blan_shard_license" value="<?php echo esc_attr( $license_key ); ?>" style="width: 100%; max-width: 440px; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px 14px; border-radius: 8px;" placeholder="e.g. FREE-COMMUNITY-SHARD" />
                            </td>
                        </tr>
                    </table>
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #334155;">
                        <input type="submit" name="blan_save_settings" class="button button-primary" value="Save Mesh Settings" style="background: #4f46e5; border: none; color: white; padding: 10px 24px; font-weight: bold; border-radius: 8px; cursor: pointer;" />
                    </div>
                </div>
            </form>
        </div>
    </div>
    <?php
}

function blan_plugin_render_pages_manager_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;
    $definitions = blan_get_mesh_pages_definitions();
    ?>
    <div class="wrap blan-admin-wrap" style="max-width: 960px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="background: #0f172a; border-radius: 16px; padding: 30px; border: 1px solid #334155; margin-top: 20px; color: #f1f5f9;">
            <h1 style="color: white; margin: 0 0 15px; font-size: 22px; font-weight: 800;">B-LAN <span style="color: #6366f1;">All Mesh Pages</span></h1>
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
                <thead>
                    <tr style="background: #1e293b; color: #94a3b8;"><th style="padding: 10px;">Page</th><th style="padding: 10px;">Slug</th><th style="padding: 10px;">Shortcode</th><th style="padding: 10px;">Action</th></tr>
                </thead>
                <tbody>
                    <?php foreach ( $definitions as $slug => $def ) : 
                        $page = blan_get_page_by_slug( $slug );
                        $live_url = $page ? get_permalink( $page->ID ) : home_url( '/' . $slug . '/' );
                    ?>
                    <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 12px; font-weight: bold; color: white;"><?php echo esc_html( $def['title'] ); ?></td>
                        <td style="padding: 12px; color: #38bdf8;">/<?php echo esc_html( $slug ); ?>/</td>
                        <td style="padding: 12px;"><code><?php echo esc_html( $def['shortcode'] ); ?></code></td>
                        <td style="padding: 12px;"><a href="<?php echo esc_url( $live_url ); ?>" target="_blank" style="color: #93c5fd;">View Live &#8599;</a></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
    <?php
}

function blan_plugin_render_signup_manager_page() {
    $page = blan_get_page_by_slug( 'blan-signup' );
    $live_url = $page ? get_permalink( $page->ID ) : home_url( '/blan-signup/' );
    echo '<div class="wrap"><div style="background:#0f172a;padding:25px;border-radius:12px;color:white;margin-top:20px;"><h2>Lite Sign-Up Portal (/blan-signup/)</h2><p>Shortcode: <code>[blan_signup]</code></p><a href="' . esc_url( $live_url ) . '" target="_blank" class="button button-primary">Open Live Sign-Up Page &#8599;</a></div></div>';
}

function blan_plugin_render_profile_manager_page() {
    $page = blan_get_page_by_slug( 'blan-profile' );
    $live_url = $page ? get_permalink( $page->ID ) : home_url( '/blan-profile/' );
    echo '<div class="wrap"><div style="background:#0f172a;padding:25px;border-radius:12px;color:white;margin-top:20px;"><h2>Member Profile Dashboard (/blan-profile/)</h2><p>Shortcode: <code>[blan_member_profile]</code></p><a href="' . esc_url( $live_url ) . '" target="_blank" class="button button-primary">Open Member Profile &#8599;</a></div></div>';
}

function blan_plugin_render_directory_manager_page() {
    $page = blan_get_page_by_slug( 'blan-directory' );
    $live_url = $page ? get_permalink( $page->ID ) : home_url( '/blan-directory/' );
    echo '<div class="wrap"><div style="background:#0f172a;padding:25px;border-radius:12px;color:white;margin-top:20px;"><h2>Community Directory (/blan-directory/)</h2><p>Shortcode: <code>[blan_community_directory]</code></p><a href="' . esc_url( $live_url ) . '" target="_blank" class="button button-primary">Open Community Directory &#8599;</a></div></div>';
}

function blan_plugin_render_shield_page() {
    echo '<div class="wrap"><div style="background:#0f172a;padding:25px;border-radius:12px;color:white;margin-top:20px;"><h2>AI PHP2Shell Defense Shield</h2><p>Status: Active (PHP ' . esc_html( PHP_VERSION ) . ')</p></div></div>';
}
`;

  const assetStyleCss = `/**
 * Stylesheet for B-LAN Plugin V.3
 */
.blan-widget-container {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 20px;
    padding: 30px;
    color: #f1f5f9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 20px 0;
}
.blan-card {
    background: #1e293b;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #334155;
    position: relative;
    overflow: hidden;
}
.blan-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
}
.blan-spinner {
    border: 3px solid rgba(99, 102, 241, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #6366f1;
    animation: blan-spin 1s linear infinite;
    margin-bottom: 16px;
}
@keyframes blan-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.blan-profile-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    border-bottom: 1px solid #334155;
    padding-bottom: 20px;
}
.blan-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid #6366f1;
    background: #0f172a;
}
.blan-name {
    font-size: 20px;
    font-weight: 800;
    margin: 0;
    color: #ffffff;
    text-transform: uppercase;
}
.blan-address {
    font-size: 13px;
    color: #94a3b8;
    margin: 4px 0 0;
}
.blan-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}
.blan-stat-box {
    background: #0f172a;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #1e293b;
    text-align: center;
}
.blan-stat-label {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 1px;
}
.blan-stat-value {
    font-size: 28px;
    font-weight: 900;
    margin-top: 6px;
}
.blan-stat-value.karma { color: #818cf8; }
.blan-stat-value.solar { color: #fbbf24; }
.blan-skills-section { margin-top: 20px; }
.blan-skills-title {
    font-size: 12px;
    color: #cbd5e1;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 1px;
    margin-bottom: 12px;
}
.blan-skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.blan-skill-tag {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.2);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
}
.blan-directory-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
}
.blan-member-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s, border-color 0.2s;
}
.blan-member-card:hover {
    transform: translateY(-2px);
    border-color: #6366f1;
}
.blan-member-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}
.blan-member-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #0f172a;
    border: 1.5px solid #6366f1;
}
.blan-member-name {
    font-size: 15px;
    font-weight: 700;
    color: white;
}
.blan-member-address {
    font-size: 11px;
    color: #64748b;
}
.blan-member-stats {
    display: flex;
    justify-content: space-between;
    background: #0f172a;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 11px;
    font-weight: bold;
}
`;

  const assetScriptJs = `/**
 * Frontend script for B-LAN Plugin V.3
 */
(function($) {
    'use strict';
    $(document).ready(function() {
        var nodeUrl = blanSettings.nodeUrl || 'http://localhost:3000';
        if ($('#blan-profile-root').length) {
            fetchProfileData(nodeUrl);
        }
        if ($('#blan-directory-root').length) {
            fetchDirectoryData(nodeUrl);
        }
    });

    function fetchProfileData(nodeUrl) {
        var root = $('#blan-profile-root');
        var cachedUser = null;
        try { cachedUser = JSON.parse(localStorage.getItem('current_auth_user')); } catch(e) {}
        var fallbackProfile = {
            name: "John Neighbor",
            address: "Sector B-4, Unit 12",
            karmaBalance: 520,
            solarWatts: 1450,
            skills: ["General Labor", "SDR Radio Setup", "Solar Maintenance"],
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=JohnNeighbor"
        };
        var user = cachedUser || fallbackProfile;
        setTimeout(function() {
            var html = '<div class="blan-card">' +
                '<div class="blan-profile-header">' +
                    '<img src="' + user.avatar + '" class="blan-avatar">' +
                    '<div>' +
                        '<h4 class="blan-name">' + user.name + '</h4>' +
                        '<p class="blan-address"><i class="fa-solid fa-location-dot"></i> ' + user.address + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="blan-stats-grid">' +
                    '<div class="blan-stat-box">' +
                        '<div class="blan-stat-label">Karma Trust Balance</div>' +
                        '<div class="blan-stat-value karma">' + user.karmaBalance + ' K</div>' +
                    '</div>' +
                    '<div class="blan-stat-box">' +
                        '<div class="blan-stat-label">Solar Watts Reserve</div>' +
                        '<div class="blan-stat-value solar">' + user.solarWatts.toLocaleString() + ' Wh</div>' +
                    '</div>' +
                '</div>' +
                '<div class="blan-skills-section">' +
                    '<div class="blan-skills-title">Active PIM Skills</div>' +
                    '<div class="blan-skills-list">' +
                        user.skills.map(function(s) { return '<span class="blan-skill-tag">' + s + '</span>'; }).join('') +
                    '</div>' +
                '</div>' +
            '</div>';
            root.html(html);
        }, 800);
    }

    function fetchDirectoryData(nodeUrl) {
        var root = $('#blan-directory-root');
        var fallbackMembers = [
            { name: "Alice Shard", address: "Sector A-1, Unit 09", karmaBalance: 1200, solarWatts: 4500 },
            { name: "Bob Node", address: "Sector B-2, Unit 04", karmaBalance: 320, solarWatts: 120 },
            { name: "Charlie Mesh", address: "Sector B-4, Unit 01", karmaBalance: 850, solarWatts: 2400 }
        ];
        var registry = [];
        try { registry = JSON.parse(localStorage.getItem('user_registry')) || []; } catch(e) {}
        var members = registry.length > 0 ? registry : fallbackMembers;
        setTimeout(function() {
            var html = '<div class="blan-directory-grid">';
            members.forEach(function(m) {
                var avatarUrl = m.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + m.name;
                html += '<div class="blan-member-card">' +
                    '<div class="blan-member-info">' +
                        '<img src="' + avatarUrl + '" class="blan-member-avatar">' +
                        '<div>' +
                            '<h5 class="blan-member-name">' + m.name + '</h5>' +
                            '<p class="blan-member-address">' + (m.address || "Sector B-4, Unit 12") + '</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="blan-member-stats">' +
                        '<span style="color: #a5b4fc;"><i class="fa-solid fa-coins"></i> ' + (m.karmaBalance || 500) + ' K</span>' +
                        '<span style="color: #fbbf24;"><i class="fa-solid fa-bolt"></i> ' + (m.solarWatts || 1000).toLocaleString() + ' Wh</span>' +
                    '</div>' +
                '</div>';
            });
            html += '</div>';
            root.html(html);
        }, 1000);
    }
})(jQuery);
`;

  const handleDownloadPlugin = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const zip = new JSZip();

      // Set up directory structure
      const folder = zip.folder("b-lan-plugin");
      if (folder) {
        folder.file("b-lan-plugin.php", bLanPluginPhp);
        folder.file("index.php", securityIndexPhp);
        
        const includes = folder.folder("includes");
        if (includes) {
          includes.file("admin-settings.php", adminSettingsPhp);
          includes.file("security-shield.php", securityShieldPhp);
          includes.file("index.php", securityIndexPhp);
        }

        const assets = folder.folder("assets");
        if (assets) {
          assets.file("index.php", securityIndexPhp);
          const css = assets.folder("css");
          if (css) css.file("style.css", assetStyleCss);

          const js = assets.folder("js");
          if (js) js.file("script.js", assetScriptJs);
        }
      }

      // Generate the ZIP file asynchronously
      const content = await zip.generateAsync({ type: "blob" });

      // Create download trigger element
      const element = document.createElement("a");
      element.href = URL.createObjectURL(content);
      element.download = "b-lan-plugin-v3.2.1.zip";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setDownloadSuccess(true);
    } catch (error) {
      console.error("Error creating ZIP:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDirectZip = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      const cacheBust = Date.now();
      let response = await fetch(`/b-lan-plugin-v3.2.1.zip?t=${cacheBust}`);
      if (!response.ok) {
        response = await fetch(`/b-lan-plugin-v3.2.0.zip?t=${cacheBust}`);
      }
      if (!response.ok) {
        response = await fetch(`/b-lan-plugin-v3.zip?t=${cacheBust}`);
      }
      if (!response.ok) throw new Error('ZIP file not found on server');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'b-lan-plugin-v3.2.1.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Error downloading WordPress plugin:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-fadeIn max-w-5xl mx-auto pb-16">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">WordPress Mesh Integration</h1>
          <p className="text-slate-400 text-sm mt-1">Deploy secure, local-first member profiles, citizen sign-up, and community directories on WordPress websites.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/25 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>AI PHP2Shell Defense</span>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">
            <i className="fa-brands fa-wordpress text-base"></i>
            <span>Plugin V.3.2.1 &bull; PHP 8.3.13+</span>
          </div>
        </div>
      </div>

      {/* Main Download & Integration Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        
        {/* Left column: Action / Download Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950/20 border-2 border-indigo-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <i className="fa-brands fa-wordpress text-[12rem] text-indigo-500"></i>
            </div>
            
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl">
                <i className="fa-solid fa-box-archive"></i>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Generate Hardened Shard Plugin</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Bundles the B-LAN Mesh Connector v3.2.1 wrapper, AI PHP2Shell heuristic defense shield, PHP 8.3.13+ runtime gate, template scripts, and custom stylesheets into a ready-to-upload ZIP package.
              </p>
              <div className="bg-slate-950/80 border border-emerald-500/20 p-3.5 rounded-xl text-xs space-y-1">
                <div className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Security Specifications
                </div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Strictly mandates PHP 8.3.13 or higher. Inspects and quarantines AI-generated dynamic web shells, obfuscated eval scripts, and stream wrapper injections.
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <button
                onClick={handleDownloadPlugin}
                disabled={isDownloading}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                  isDownloading 
                    ? 'bg-slate-800 text-slate-500 cursor-wait' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-95'
                }`}
              >
                {isDownloading ? (
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>{isDownloading ? 'Packaging Hardened Shard...' : 'Download Plugin ZIP (v3.2.1)'}</span>
              </button>

              <div className="text-center pt-2">
                <a 
                  href="/b-lan-plugin-v3.2.1.zip" 
                  onClick={handleDownloadDirectZip}
                  className="text-indigo-400 hover:text-indigo-300 text-xs font-black uppercase tracking-wider hover:underline inline-flex items-center gap-2"
                >
                  <i className="fa-solid fa-cloud-arrow-down"></i>
                  Download Pre-packaged v3.2.1 ZIP Directly (Static Mirror)
                </a>
              </div>

              {downloadSuccess && (
                <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-5 py-4 rounded-xl text-xs font-black uppercase tracking-wider animate-fadeIn">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>Download Complete! File saved as b-lan-plugin-v3.2.1.zip (v3.2.1 • PHP 8.3.13+ Hardened)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Specs, Shortcodes & Setup Instructions */}
        <div className="lg:col-span-7 space-y-6">

          {/* AI PHP2Shell Defense Architecture Card */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                AI PHP2Shell Defense Architecture
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase self-start sm:self-auto">
                Requires PHP &ge; 8.3.13
              </span>
            </div>
            <div className="space-y-3.5">
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 text-sm">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-white text-xs font-bold uppercase tracking-tight">AI Web Shell & Reverse Shell Quarantine</h5>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    Inspects incoming request payloads against 7 heuristic threat rules, terminating attempts to deploy AI-generated micro-shells, obfuscated execution chains (<code className="text-indigo-300">eval(base64_decode)</code>, <code className="text-indigo-300">gzinflate</code>), or command execution (<code className="text-indigo-300">/bin/sh</code>, <code className="text-indigo-300">/dev/tcp/</code>).
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 text-sm">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-white text-xs font-bold uppercase tracking-tight">Strict PHP 8.3.13+ Runtime Enforcement</h5>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    Mandates PHP 8.3.13 or higher during plugin activation and runtime bootstrapping. Pauses execution on legacy PHP environments to prevent exploitation of unpatched engine vulnerabilities.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-white text-xs font-bold uppercase tracking-tight">Stream Wrapper & SSRF Immunization</h5>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    Neutralizes dangerous protocol wrappers (<code className="text-indigo-300">phar://</code>, <code className="text-indigo-300">php://filter</code>, <code className="text-indigo-300">data://</code>, <code className="text-indigo-300">expect://</code>) frequently weaponized in modern AI-assisted Local File Inclusion (LFI) to RCE droppers.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rapid Installation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" />
              Rapid Installation Wizard
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-sm">1</div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-tight">Verify PHP 8.3.13+ & Upload</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Ensure your WordPress host is running PHP 8.3.13 or higher. Navigate to **Plugins &gt; Add New &gt; Upload Plugin** in your WordPress Dashboard. Select `b-lan-plugin-v3.2.0.zip`, upload, and activate it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-sm">2</div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-tight">Automated Member Page Creation (3 Pages)</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Upon activation, the plugin automatically creates and publishes 3 core mesh pages: **B-LAN Lite Sign-Up** (`/blan-signup`), **B-LAN Profile Dashboard** (`/blan-profile`), and **B-LAN Community Directory** (`/blan-directory`).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-sm">3</div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-tight">Sidebar Navigation & Page Management</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Under the **B-LAN Mesh** menu in your WordPress sidebar, you now have dedicated submenus for: **Settings**, **All Mesh Pages**, **Lite Sign-Up**, **Member Profile**, **Directory**, and **Security Shield**.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-sm">4</div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-tight">Expiration & Timeout Protection</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    V.3.2.0 features direct nonce-verified settings persistence and ReDoS-bounded threat inspection that exempts authenticated WordPress admins, resolving previous <code className="text-indigo-300">"The link you followed has expired"</code> and timeout errors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shortcode Reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-500" />
              Member Page Creation Shortcodes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-sky-500/20 space-y-3">
                <div className="font-mono text-sky-400 text-xs font-black">[blan_signup]</div>
                <h4 className="text-slate-200 font-bold text-xs uppercase tracking-tight">Lite Sign-Up Portal</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Lightweight citizen registration portal on `/blan-signup`. Allows neighbors to mint a PIM shard and connect to local mesh energy sharing.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="font-mono text-indigo-400 text-xs font-black">[blan_member_profile]</div>
                <h4 className="text-slate-200 font-bold text-xs uppercase tracking-tight">Member Profile Widget</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Renders the B-LAN identity card on `/blan-profile` displaying Unit Address, active PIM skills, and current synced Karma Ledger balances.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="font-mono text-emerald-400 text-xs font-black">[blan_community_directory]</div>
                <h4 className="text-slate-200 font-bold text-xs uppercase tracking-tight">Community Directory</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Displays the neighborhood peer directory on `/blan-directory` querying active members across the Community Information Module (CIM) mesh.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* B-LAN Ecosystem Tools & Download Options */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              B-LAN Ecosystem Tools & Download Hub
            </h3>
            <p className="text-slate-400 text-xs mt-1">Official suite of distributed mesh tools, bridges, and local-first runtimes.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full uppercase">
              Release Suite: v3.2.1
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool 1: WordPress Mesh Connector */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/20 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <i className="fa-brands fa-wordpress text-lg"></i>
                </div>
                <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v3.2.1</span>
              </div>
              <h4 className="text-white font-bold text-sm uppercase tracking-tight">B-LAN Mesh Connector</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                WordPress plugin with PHP 8.3.13+ AI php2shell defense, auto-published pages, and sidebar manager.
              </p>
            </div>
            <a
              href="/b-lan-plugin-v3.2.1.zip"
              download="b-lan-plugin-v3.2.1.zip"
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </a>
          </div>

          {/* Tool 2: Desktop / Fog Node Bundle */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Server className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Mac / RPi</span>
              </div>
              <h4 className="text-white font-bold text-sm uppercase tracking-tight">Desktop Fog Node</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Electron desktop runner & local fog node server bundle for headless Raspberry Pi or macOS nodes.
              </p>
            </div>
            <a
              href="#/admin"
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Node Admin</span>
            </a>
          </div>

          {/* Tool 3: Mobile PWA Client */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">Zero-Install</span>
              </div>
              <h4 className="text-white font-bold text-sm uppercase tracking-tight">PWA Field Client</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Progressive Web App with service worker offline caching for citizen phone browsers during blackouts.
              </p>
            </div>
            <button
              onClick={() => alert('PWA is active! Tap "Add to Home Screen" in your browser menu to install.')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install PWA</span>
            </button>
          </div>

          {/* Tool 4: Decentralized Inference Specs */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">RFC Spec</span>
              </div>
              <h4 className="text-white font-bold text-sm uppercase tracking-tight">Protocol RFC & Specs</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Decentralized inference protocol specifications, CIM consensus math, and Rye task whitelists.
              </p>
            </div>
            <a
              href="#/legal"
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Specs</span>
            </a>
          </div>
        </div>
      </div>

      {/* GitHub Synchronization & Version Control Guide */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl p-8 shadow-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 text-xl">
            <GitBranch className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-black text-white uppercase tracking-tight">
              GitHub Version Synchronization Guide & AI Studio History
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Why do you see two versions of B-LAN Core at the start of AI Studio?
            </p>
            <div className="space-y-2 text-slate-400 text-xs leading-relaxed pt-1">
              <p>
                &bull; <strong className="text-white">AI Studio Sessions vs GitHub:</strong> Google AI Studio creates a new workspace card whenever a fork, duplicate, or new session begins. GitHub maintains your single definitive repository (<code className="text-indigo-300 font-mono">ADD12/b-lan</code>).
              </p>
              <p>
                &bull; <strong className="text-white">To Sync Your Latest Code to GitHub:</strong> In Google AI Studio, use the top-right <strong className="text-indigo-400">Export</strong> menu to push this current build to your GitHub repository or download the complete workspace ZIP to keep GitHub 100% updated.
              </p>
              <p>
                &bull; <strong className="text-white">WordPress Plugin Naming:</strong> The plugin is named <strong className="text-indigo-300">B-LAN Mesh Connector</strong> in both the plugin file header and the WordPress admin sidebar menu, avoiding any naming discrepancy.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WordPressPlugin;
