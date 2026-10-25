<?php
/**
 * Admin settings and mesh page management panel for B-LAN Plugin V.3.2.1
 * Hardened with AI PHP2Shell Defense Monitor and Sidebar Page Navigation.
 * 
 * @package B_LAN_Plugin
 * @version 3.2.1
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register Top-Level and Submenu Sidebar Items
 */
add_action( 'admin_menu', 'blan_plugin_add_admin_menu' );
function blan_plugin_add_admin_menu() {
    // Top-level menu: B-LAN Mesh Connector
    add_menu_page(
        'B-LAN Mesh Connector Settings',
        'B-LAN Mesh Connector',
        'manage_options',
        'b-lan-settings',
        'blan_plugin_render_settings_page',
        'dashicons-networking',
        80
    );

    // Submenu 1: Settings
    add_submenu_page(
        'b-lan-settings',
        'B-LAN Settings',
        'Settings',
        'manage_options',
        'b-lan-settings',
        'blan_plugin_render_settings_page'
    );

    // Submenu 2: All Mesh Pages Manager
    add_submenu_page(
        'b-lan-settings',
        'B-LAN Mesh Pages Manager',
        'All Mesh Pages',
        'manage_options',
        'b-lan-pages',
        'blan_plugin_render_pages_manager_page'
    );

    // Submenu 3: Lite Sign-Up Page
    add_submenu_page(
        'b-lan-settings',
        'Lite Sign-Up Page',
        'Lite Sign-Up',
        'manage_options',
        'b-lan-signup-manager',
        'blan_plugin_render_signup_manager_page'
    );

    // Submenu 4: Member Profile
    add_submenu_page(
        'b-lan-settings',
        'Member Profile Dashboard',
        'Member Profile',
        'manage_options',
        'b-lan-profile-manager',
        'blan_plugin_render_profile_manager_page'
    );

    // Submenu 5: Community Directory
    add_submenu_page(
        'b-lan-settings',
        'Community Directory',
        'Directory',
        'manage_options',
        'b-lan-directory-manager',
        'blan_plugin_render_directory_manager_page'
    );

    // Submenu 6: AI PHP2Shell Security Shield
    add_submenu_page(
        'b-lan-settings',
        'AI PHP2Shell Defense Shield',
        'Security Shield',
        'manage_options',
        'b-lan-shield',
        'blan_plugin_render_shield_page'
    );
}

/**
 * Register settings in WordPress settings registry
 */
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

/**
 * Settings Page View (b-lan-settings)
 * Uses direct robust POST handling with wp_verify_nonce to guarantee zero expiration/timeout errors
 */
function blan_plugin_render_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $notice_html = '';

    // Direct Settings Save Handler (prevents options.php expiration / redirection failure)
    if ( isset( $_POST['blan_save_settings'] ) ) {
        if ( ! isset( $_POST['blan_settings_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['blan_settings_nonce'] ) ), 'blan_save_settings_action' ) ) {
            $notice_html = '<div class="notice notice-error is-dismissible"><p><strong>Security Verification:</strong> Settings nonce expired or invalid. Please refresh the page and try again.</p></div>';
        } else {
            if ( isset( $_POST['blan_node_url'] ) ) {
                $raw_url = sanitize_text_field( wp_unslash( $_POST['blan_node_url'] ) );
                update_option( 'blan_node_url', blan_sanitize_node_url( $raw_url ) );
            }
            if ( isset( $_POST['blan_community_id'] ) ) {
                $cim_id = sanitize_text_field( wp_unslash( $_POST['blan_community_id'] ) );
                update_option( 'blan_community_id', $cim_id );
            }
            if ( isset( $_POST['blan_shard_license'] ) ) {
                $license = sanitize_text_field( wp_unslash( $_POST['blan_shard_license'] ) );
                update_option( 'blan_shard_license', $license );
            }
            $notice_html = '<div class="notice notice-success is-dismissible"><p><strong>Success:</strong> B-LAN Mesh node settings saved successfully!</p></div>';
        }
    }

    // Process manual page recreation request safely
    if ( isset( $_POST['blan_recreate_pages'] ) ) {
        if ( ! isset( $_POST['blan_recreate_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['blan_recreate_nonce'] ) ), 'blan_recreate_action' ) ) {
            $notice_html = '<div class="notice notice-error is-dismissible"><p><strong>Security Notice:</strong> The link you followed has expired or failed validation. Please refresh and try again.</p></div>';
        } else {
            blan_ensure_plugin_pages();
            $notice_html = '<div class="notice notice-success is-dismissible"><p><strong>Success:</strong> All 3 B-LAN pages (Lite Sign-Up, Member Profile, and Community Directory) are active and published!</p></div>';
        }
    }

    $node_url = blan_sanitize_node_url( get_option( 'blan_node_url', 'http://localhost:3000' ) );
    $community_id = get_option( 'blan_community_id', 'CIM-99' );
    $license_key = get_option( 'blan_shard_license', 'FREE-COMMUNITY-SHARD' );
    $threat_logs = get_option( 'blan_security_threat_logs', array() );
    if ( ! is_array( $threat_logs ) ) {
        $threat_logs = array();
    }
    $is_php_compatible = version_compare( PHP_VERSION, BLAN_MIN_PHP_VERSION, '>=' );
    ?>
    <div class="wrap blan-admin-wrap" style="max-width: 960px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        
        <?php echo $notice_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

        <div style="background: #0f172a; border-radius: 16px; padding: 30px; border: 1px solid #334155; margin-top: 20px; color: #f1f5f9; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
            
            <!-- Header banner -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="background: #4f46e5; color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                        B
                    </div>
                    <div>
                        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">B-LAN <span style="color: #6366f1;">Plugin V.3.2.1</span></h1>
                        <p style="margin: 3px 0 0; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Local-First Mesh Integration & AI PHP2Shell Defense</p>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <a href="<?php echo esc_url( admin_url( 'admin.php?page=b-lan-pages' ) ); ?>" style="text-decoration: none; background: rgba(79, 70, 229, 0.15); color: #a5b4fc; border: 1px solid rgba(79, 70, 229, 0.3); border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">
                        📁 Manage Pages
                    </a>
                    <a href="<?php echo esc_url( admin_url( 'admin.php?page=b-lan-shield' ) ); ?>" style="text-decoration: none; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">
                        🛡️ Shield Active
                    </a>
                    <div style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; border-radius: 20px; padding: 6px 12px; font-size: 11px; font-weight: bold; font-family: monospace;">
                        PHP <?php echo esc_html( PHP_VERSION ); ?>
                    </div>
                </div>
            </div>

            <!-- Quick Navigation Cards to Mesh Pages -->
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #334155;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="color: white; margin: 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Mesh Pages Installed</h3>
                    <a href="<?php echo esc_url( admin_url( 'admin.php?page=b-lan-pages' ) ); ?>" style="color: #818cf8; font-size: 12px; font-weight: bold; text-decoration: none;">View All in Sidebar &rarr;</a>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;">
                    
                    <!-- Lite Sign-Up -->
                    <div style="background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #334155;">
                        <div style="color: #38bdf8; font-weight: bold; font-size: 12px; display: flex; align-items: center; justify-content: space-between;">
                            <span>Lite Sign-Up</span>
                            <span style="font-size: 10px; background: rgba(56, 189, 248, 0.15); padding: 2px 6px; border-radius: 4px;">[blan_signup]</span>
                        </div>
                        <p style="color: #64748b; font-size: 11px; margin: 6px 0 10px;">Citizen mesh registration portal.</p>
                        <div style="display: flex; gap: 8px;">
                            <a href="<?php echo esc_url( home_url( '/blan-signup/' ) ); ?>" target="_blank" style="color: #93c5fd; font-size: 11px; text-decoration: none; font-weight: 600;">View Live &#8599;</a>
                            <span style="color: #334155;">|</span>
                            <a href="<?php echo esc_url( admin_url( 'admin.php?page=b-lan-signup-manager' ) ); ?>" style="color: #a5b4fc; font-size: 11px; text-decoration: none; font-weight: 600;">Manage</a>
                        </div>
                    </div>

                    <!-- Member Profile -->
                    <div style="background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #334155;">
                        <div style="color: #818cf8; font-weight: bold; font-size: 12px; display: flex; align-items: center; justify-content: space-between;">
                            <span>Member Profile</span>
                            <span style="font-size: 10px; background: rgba(129, 140, 248, 0.15); padding: 2px 6px; border-radius: 4px;">[blan_member_profile]</span>
                        </div>
                        <p style="color: #64748b; font-size: 11px; margin: 6px 0 10px;">PIM Identity & Karma ledger card.</p>
                        <div style="display: flex; gap: 8px;">
                            <a href="<?php echo esc_url( home_url( '/blan-profile/' ) ); ?>" target="_blank" style="color: #93c5fd; font-size: 11px; text-decoration: none; font-weight: 600;">View Live &#8599;</a>
                            <span style="color: #334155;">|</span>
                            <a href="<?php echo esc_url( admin_url( 'admin.php?page=b-lan-profile-manager' ) ); ?>" style="color: #a5b4fc; font-size: 11px; text-decoration: none; font-weight: 600;">Manage</a>
                        </div>
                    </div>

                    <!-- Directory -->
                    <div style="background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #334155;">
                        <div style="color: #34d399; font-weight: bold; font-size: 12px; display: flex; align-items: center; justify-content: space-between;">
                            <span>Community Directory</span>
                            <span style="font-size: 10px; background: rgba(52, 211, 153, 0.15); padding: 2px 6px; border-radius: 4px;">[blan_community_directory]</span>
                        </div>
                        <p style="color: #64748b; font-size: 11px; margin: 6px 0 10px;">Neighborhood peer mesh directory.</p>
                        <div style="display: flex; gap: 8px;">
                            <a href="<?php echo esc_url( home_url( '/blan-directory/' ) ); ?>" target="_blank" style="color: #93c5fd; font-size: 11px; text-decoration: none; font-weight: 600;">View Live &#8599;</a>
                            <span style="color: #334155;">|</span>
                            <a href="<?php echo esc_url( admin_url( 'admin.php?page=b-lan-directory-manager' ) ); ?>" style="color: #a5b4fc; font-size: 11px; text-decoration: none; font-weight: 600;">Manage</a>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Settings Form (Direct POST handling to eliminate timeout & expiration errors) -->
            <form method="post" action="">
                <?php wp_nonce_field( 'blan_save_settings_action', 'blan_settings_nonce' ); ?>

                <div style="background: #1e293b; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #334155;">
                    <h3 style="color: white; margin-top: 0; font-size: 15px; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 10px;">Rapid Setup Wizard</h3>
                    
                    <table class="form-table" style="color: #94a3b8; width: 100%;">
                        <tr valign="top">
                            <th scope="row" style="color: #cbd5e1; font-weight: 600; width: 250px;">B-LAN Node Address</th>
                            <td>
                                <input type="url" name="blan_node_url" value="<?php echo esc_url( $node_url ); ?>" style="width: 100%; max-width: 440px; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px 14px; border-radius: 8px;" placeholder="e.g. http://192.168.1.100:3000" required />
                                <p class="description" style="color: #64748b; margin-top: 6px; font-size: 11px;">The local IP/host URL of your active B-LAN physical node. Protected against stream wrappers and SSRF.</p>
                            </td>
                        </tr>
                        <tr valign="top">
                            <th scope="row" style="color: #cbd5e1; font-weight: 600;">Community Module ID (CIM)</th>
                            <td>
                                <input type="text" name="blan_community_id" value="<?php echo esc_attr( $community_id ); ?>" style="width: 100%; max-width: 440px; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px 14px; border-radius: 8px;" placeholder="e.g. CIM-99" required />
                                <p class="description" style="color: #64748b; margin-top: 6px; font-size: 11px;">Identifies which physical neighborhood mesh ledger is targeted.</p>
                            </td>
                        </tr>
                        <tr valign="top">
                            <th scope="row" style="color: #cbd5e1; font-weight: 600;">License Node Shard</th>
                            <td>
                                <input type="text" name="blan_shard_license" value="<?php echo esc_attr( $license_key ); ?>" style="width: 100%; max-width: 440px; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px 14px; border-radius: 8px;" placeholder="e.g. FREE-COMMUNITY-SHARD" />
                                <p class="description" style="color: #64748b; margin-top: 6px; font-size: 11px;">Local developer cluster license key.</p>
                            </td>
                        </tr>
                    </table>

                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #334155; display: flex; gap: 15px; align-items: center;">
                        <input type="submit" name="blan_save_settings" class="button button-primary" value="Save Mesh Settings" style="background: #4f46e5; border: none; color: white; padding: 10px 24px; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);" />
                    </div>
                </div>
            </form>

            <!-- Re-create / Verify Pages Tool Section -->
            <div style="background: rgba(79, 70, 229, 0.05); border-radius: 12px; padding: 20px; margin-top: 25px; border: 1px solid rgba(79, 70, 229, 0.15); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="color: #a5b4fc; margin: 0 0 4px; font-size: 14px; font-weight: 700;">1-Click Mesh Page Synchronizer</h3>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        Auto-generate or repair missing pages: <strong>Lite Sign-Up</strong> (<code>[blan_signup]</code>), <strong>Member Profile</strong> (<code>[blan_member_profile]</code>), and <strong>Directory</strong> (<code>[blan_community_directory]</code>).
                    </p>
                </div>
                <form method="post" action="" style="margin: 0;">
                    <?php wp_nonce_field( 'blan_recreate_action', 'blan_recreate_nonce' ); ?>
                    <input type="submit" name="blan_recreate_pages" class="button" value="Repair / Sync Pages" style="background: #1e293b; border: 1px solid #4f46e5; color: #a5b4fc; padding: 8px 16px; font-weight: bold; border-radius: 8px; cursor: pointer;" />
                </form>
            </div>

            <!-- Footer info -->
            <div style="margin-top: 25px; border-top: 1px solid #1e293b; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #475569;">
                <span>B-LAN Core Stack v2.0 // WP Module V.3.2.0</span>
                <span>Protected by AI PHP2Shell Defense Shield</span>
            </div>

        </div>
    </div>
    <?php
}

/**
 * Submenu: All Mesh Pages Manager (b-lan-pages)
 * Lists all pages created on install with live links, WP editor links, status, and shortcodes.
 */
function blan_plugin_render_pages_manager_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $notice_html = '';
    if ( isset( $_POST['blan_recreate_pages'] ) ) {
        if ( ! isset( $_POST['blan_recreate_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['blan_recreate_nonce'] ) ), 'blan_recreate_action' ) ) {
            $notice_html = '<div class="notice notice-error is-dismissible"><p>Security verification failed. Please try again.</p></div>';
        } else {
            blan_ensure_plugin_pages();
            $notice_html = '<div class="notice notice-success is-dismissible"><p><strong>Success:</strong> All B-LAN mesh pages have been verified and regenerated!</p></div>';
        }
    }

    $definitions = blan_get_mesh_pages_definitions();
    ?>
    <div class="wrap blan-admin-wrap" style="max-width: 960px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        
        <?php echo $notice_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

        <div style="background: #0f172a; border-radius: 16px; padding: 30px; border: 1px solid #334155; margin-top: 20px; color: #f1f5f9; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
            
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px;">
                <div>
                    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">B-LAN <span style="color: #6366f1;">Mesh Pages Manager</span></h1>
                    <p style="margin: 3px 0 0; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Manage pages created on install &amp; shortcode deployment</p>
                </div>
                <form method="post" action="" style="margin: 0;">
                    <?php wp_nonce_field( 'blan_recreate_action', 'blan_recreate_nonce' ); ?>
                    <input type="submit" name="blan_recreate_pages" class="button" value="&#8635; Regenerate Missing Pages" style="background: #4f46e5; border: none; color: white; padding: 8px 18px; font-weight: bold; border-radius: 8px; cursor: pointer;" />
                </form>
            </div>

            <!-- Table of Created Pages -->
            <div style="background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 25px;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
                    <thead>
                        <tr style="background: #0f172a; border-bottom: 1px solid #334155; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
                            <th style="padding: 14px 16px;">Page Name</th>
                            <th style="padding: 14px 16px;">Slug / URL</th>
                            <th style="padding: 14px 16px;">Shortcode</th>
                            <th style="padding: 14px 16px;">Status</th>
                            <th style="padding: 14px 16px; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ( $definitions as $slug => $def ) : 
                            $page = blan_get_page_by_slug( $slug );
                            $exists = ! empty( $page );
                            $is_published = $exists && $page->post_status === 'publish';
                            $live_url = $exists ? get_permalink( $page->ID ) : home_url( '/' . $slug . '/' );
                            $edit_url = $exists ? admin_url( 'post.php?post=' . $page->ID . '&action=edit' ) : '#';
                        ?>
                        <tr style="border-bottom: 1px solid #334155;">
                            <td style="padding: 16px;">
                                <div style="font-weight: 700; color: white; font-size: 13px;"><?php echo esc_html( $def['title'] ); ?></div>
                                <div style="color: #64748b; font-size: 11px; margin-top: 3px;"><?php echo esc_html( $def['description'] ); ?></div>
                            </td>
                            <td style="padding: 16px; font-family: monospace; color: #38bdf8;">
                                /<?php echo esc_html( $slug ); ?>/
                            </td>
                            <td style="padding: 16px;">
                                <code style="background: #0f172a; padding: 4px 8px; border-radius: 4px; color: #a5b4fc; border: 1px solid #334155; font-size: 11px;">
                                    <?php echo esc_html( $def['shortcode'] ); ?>
                                </code>
                            </td>
                            <td style="padding: 16px;">
                                <?php if ( $is_published ) : ?>
                                    <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 4px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                                        &#10003; Published (ID: <?php echo esc_html( $page->ID ); ?>)
                                    </span>
                                <?php elseif ( $exists ) : ?>
                                    <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 4px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                                        &#9888; <?php echo esc_html( ucfirst( $page->post_status ) ); ?>
                                    </span>
                                <?php else : ?>
                                    <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 4px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                                        &#10007; Missing
                                    </span>
                                <?php endif; ?>
                            </td>
                            <td style="padding: 16px; text-align: right;">
                                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                    <?php if ( $exists ) : ?>
                                        <a href="<?php echo esc_url( $live_url ); ?>" target="_blank" class="button button-small" style="background: #0f172a; border: 1px solid #38bdf8; color: #38bdf8; border-radius: 6px;">
                                            View Page &#8599;
                                        </a>
                                        <a href="<?php echo esc_url( $edit_url ); ?>" class="button button-small" style="background: #334155; border: 1px solid #475569; color: #cbd5e1; border-radius: 6px;">
                                            Edit in WP
                                        </a>
                                    <?php else : ?>
                                        <form method="post" action="" style="display: inline; margin: 0;">
                                            <?php wp_nonce_field( 'blan_recreate_action', 'blan_recreate_nonce' ); ?>
                                            <input type="submit" name="blan_recreate_pages" class="button button-small" value="Create Now" style="background: #4f46e5; border: none; color: white; border-radius: 6px;" />
                                        </form>
                                    <?php endif; ?>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Info box -->
            <div style="background: rgba(79, 70, 229, 0.08); border: 1px solid rgba(79, 70, 229, 0.2); border-radius: 12px; padding: 18px;">
                <h4 style="color: #a5b4fc; margin: 0 0 6px; font-size: 13px; font-weight: 700;">💡 How Mesh Shortcodes Work in WordPress</h4>
                <p style="color: #cbd5e1; font-size: 12px; line-height: 1.6; margin: 0;">
                    You can paste these shortcodes into <strong>any</strong> page, post, or Elementor / Gutenberg block on your site. The plugin automatically mounts the local-first mesh components and connects to your configured local node address.
                </p>
            </div>

        </div>
    </div>
    <?php
}

/**
 * Submenu: Lite Sign-Up Page View & Manager (b-lan-signup-manager)
 */
function blan_plugin_render_signup_manager_page() {
    $page = blan_get_page_by_slug( 'blan-signup' );
    $live_url = $page ? get_permalink( $page->ID ) : home_url( '/blan-signup/' );
    $edit_url = $page ? admin_url( 'post.php?post=' . $page->ID . '&action=edit' ) : '#';
    ?>
    <div class="wrap blan-admin-wrap" style="max-width: 960px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="background: #0f172a; border-radius: 16px; padding: 30px; border: 1px solid #334155; margin-top: 20px; color: #f1f5f9; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
            
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px;">
                <div>
                    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">B-LAN <span style="color: #38bdf8;">Lite Sign-Up Portal</span></h1>
                    <p style="margin: 3px 0 0; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Live Page: /blan-signup/ &bull; Shortcode: [blan_signup]</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <a href="<?php echo esc_url( $live_url ); ?>" target="_blank" class="button" style="background: #38bdf8; color: #0f172a; border: none; font-weight: bold; border-radius: 8px; padding: 6px 14px;">
                        Open Public Sign-Up Page &#8599;
                    </a>
                    <?php if ( $page ) : ?>
                    <a href="<?php echo esc_url( $edit_url ); ?>" class="button" style="background: #1e293b; color: #cbd5e1; border: 1px solid #475569; font-weight: bold; border-radius: 8px; padding: 6px 14px;">
                        Edit in WordPress
                    </a>
                    <?php endif; ?>
                </div>
            </div>

            <div style="background: #1e293b; border-radius: 12px; padding: 25px; border: 1px solid #334155; margin-bottom: 25px;">
                <h3 style="color: white; margin-top: 0; font-size: 15px; font-weight: 700;">Lite Sign-Up Preview &amp; Configuration</h3>
                <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
                    The Lite Sign-Up portal allows new neighbors and citizens to onboard into the B-LAN local mesh network without complex credentials. Citizens select their neighborhood sector, choose their initial skills, and mint a local Peer Identity Module (PIM) shard that syncs with your B-LAN Node.
                </p>
                
                <div style="margin-top: 20px; border: 1px solid #334155; border-radius: 8px; padding: 20px; background: #0f172a;">
                    <h4 style="color: #38bdf8; margin: 0 0 10px; font-size: 13px; font-weight: 700;">Live Frontend Component Preview</h4>
                    <?php echo do_shortcode( '[blan_signup]' ); ?>
                </div>
            </div>

        </div>
    </div>
    <?php
}

/**
 * Submenu: Member Profile Page Manager (b-lan-profile-manager)
 */
function blan_plugin_render_profile_manager_page() {
    $page = blan_get_page_by_slug( 'blan-profile' );
    $live_url = $page ? get_permalink( $page->ID ) : home_url( '/blan-profile/' );
    $edit_url = $page ? admin_url( 'post.php?post=' . $page->ID . '&action=edit' ) : '#';
    ?>
    <div class="wrap blan-admin-wrap" style="max-width: 960px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="background: #0f172a; border-radius: 16px; padding: 30px; border: 1px solid #334155; margin-top: 20px; color: #f1f5f9; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
            
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px;">
                <div>
                    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">B-LAN <span style="color: #818cf8;">Member Profile Dashboard</span></h1>
                    <p style="margin: 3px 0 0; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Live Page: /blan-profile/ &bull; Shortcode: [blan_member_profile]</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <a href="<?php echo esc_url( $live_url ); ?>" target="_blank" class="button" style="background: #818cf8; color: #0f172a; border: none; font-weight: bold; border-radius: 8px; padding: 6px 14px;">
                        Open Public Profile &#8599;
                    </a>
                    <?php if ( $page ) : ?>
                    <a href="<?php echo esc_url( $edit_url ); ?>" class="button" style="background: #1e293b; color: #cbd5e1; border: 1px solid #475569; font-weight: bold; border-radius: 8px; padding: 6px 14px;">
                        Edit in WordPress
                    </a>
                    <?php endif; ?>
                </div>
            </div>

            <div style="background: #1e293b; border-radius: 12px; padding: 25px; border: 1px solid #334155;">
                <h3 style="color: white; margin-top: 0; font-size: 15px; font-weight: 700;">Profile Dashboard Component</h3>
                <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
                    Displays the logged-in citizen's PIM passport, solar energy reserves, and verified Karma trust tokens directly from the local physical node.
                </p>
                <div style="margin-top: 20px; border: 1px solid #334155; border-radius: 8px; padding: 20px; background: #0f172a;">
                    <h4 style="color: #818cf8; margin: 0 0 10px; font-size: 13px; font-weight: 700;">Live Frontend Component Preview</h4>
                    <?php echo do_shortcode( '[blan_member_profile]' ); ?>
                </div>
            </div>

        </div>
    </div>
    <?php
}

/**
 * Submenu: Community Directory Manager (b-lan-directory-manager)
 */
function blan_plugin_render_directory_manager_page() {
    $page = blan_get_page_by_slug( 'blan-directory' );
    $live_url = $page ? get_permalink( $page->ID ) : home_url( '/blan-directory/' );
    $edit_url = $page ? admin_url( 'post.php?post=' . $page->ID . '&action=edit' ) : '#';
    ?>
    <div class="wrap blan-admin-wrap" style="max-width: 960px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="background: #0f172a; border-radius: 16px; padding: 30px; border: 1px solid #334155; margin-top: 20px; color: #f1f5f9; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
            
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px;">
                <div>
                    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">B-LAN <span style="color: #34d399;">Community Directory</span></h1>
                    <p style="margin: 3px 0 0; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Live Page: /blan-directory/ &bull; Shortcode: [blan_community_directory]</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <a href="<?php echo esc_url( $live_url ); ?>" target="_blank" class="button" style="background: #34d399; color: #0f172a; border: none; font-weight: bold; border-radius: 8px; padding: 6px 14px;">
                        Open Public Directory &#8599;
                    </a>
                    <?php if ( $page ) : ?>
                    <a href="<?php echo esc_url( $edit_url ); ?>" class="button" style="background: #1e293b; color: #cbd5e1; border: 1px solid #475569; font-weight: bold; border-radius: 8px; padding: 6px 14px;">
                        Edit in WordPress
                    </a>
                    <?php endif; ?>
                </div>
            </div>

            <div style="background: #1e293b; border-radius: 12px; padding: 25px; border: 1px solid #334155;">
                <h3 style="color: white; margin-top: 0; font-size: 15px; font-weight: 700;">Community Directory Component</h3>
                <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
                    Queries active peers in the neighborhood CIM mesh shard, showcasing skills, node location, and microgrid solar status.
                </p>
                <div style="margin-top: 20px; border: 1px solid #334155; border-radius: 8px; padding: 20px; background: #0f172a;">
                    <h4 style="color: #34d399; margin: 0 0 10px; font-size: 13px; font-weight: 700;">Live Frontend Component Preview</h4>
                    <?php echo do_shortcode( '[blan_community_directory]' ); ?>
                </div>
            </div>

        </div>
    </div>
    <?php
}

/**
 * Submenu: Security Shield & Threat Monitor (b-lan-shield)
 */
function blan_plugin_render_shield_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $notice_html = '';
    // Process threat log clear safely
    if ( isset( $_POST['blan_clear_threats'] ) ) {
        if ( ! isset( $_POST['blan_clear_threats_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['blan_clear_threats_nonce'] ) ), 'blan_clear_threats_action' ) ) {
            $notice_html = '<div class="notice notice-error is-dismissible"><p>Security check failed. Please refresh the page and try again.</p></div>';
        } else {
            update_option( 'blan_security_threat_logs', array() );
            $notice_html = '<div class="notice notice-success is-dismissible"><p><strong>Success:</strong> AI PHP2Shell Threat logs cleared.</p></div>';
        }
    }

    $threat_logs = get_option( 'blan_security_threat_logs', array() );
    if ( ! is_array( $threat_logs ) ) {
        $threat_logs = array();
    }
    $is_php_compatible = version_compare( PHP_VERSION, BLAN_MIN_PHP_VERSION, '>=' );
    ?>
    <div class="wrap blan-admin-wrap" style="max-width: 960px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        
        <?php echo $notice_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

        <div style="background: #0f172a; border-radius: 16px; padding: 30px; border: 1px solid #334155; margin-top: 20px; color: #f1f5f9; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
            
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 28px;">🛡️</span>
                    <div>
                        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">AI PHP2Shell <span style="color: #10b981;">Defense Shield</span></h1>
                        <p style="margin: 3px 0 0; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Heuristic RCE &amp; Dynamic Web Shell Quarantine Engine</p>
                    </div>
                </div>
                <div style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                    Enforced: PHP <?php echo esc_html( BLAN_MIN_PHP_VERSION ); ?>+
                </div>
            </div>

            <!-- Diagnostics -->
            <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div style="background: #1e293b; padding: 18px; border-radius: 10px; border: 1px solid #334155;">
                    <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">PHP Engine Status</div>
                    <div style="font-size: 16px; font-weight: 800; color: <?php echo $is_php_compatible ? '#34d399' : '#f87171'; ?>;">
                        <?php echo $is_php_compatible ? '✓ ' . esc_html( PHP_VERSION ) . ' (SECURE)' : '✗ ' . esc_html( PHP_VERSION ) . ' (INCOMPATIBLE)'; ?>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Min required: PHP <?php echo esc_html( BLAN_MIN_PHP_VERSION ); ?></div>
                </div>

                <div style="background: #1e293b; padding: 18px; border-radius: 10px; border: 1px solid #334155;">
                    <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">AI Web Shell Filter</div>
                    <div style="font-size: 16px; font-weight: 800; color: #34d399;">
                        ✓ ACTIVE (7 Rules)
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">ReDoS-bounded heuristics</div>
                </div>

                <div style="background: #1e293b; padding: 18px; border-radius: 10px; border: 1px solid #334155;">
                    <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Threats Blocked</div>
                    <div style="font-size: 16px; font-weight: 800; color: #a5b4fc;">
                        <?php echo count( $threat_logs ); ?> QUARANTINED
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Automatic 403 termination</div>
                </div>
            </div>

            <!-- Intercepted Threat Log -->
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                    <h3 style="color: white; margin: 0; font-size: 14px; font-weight: 700;">Recent Intercepted Injections</h3>
                    <?php if ( ! empty( $threat_logs ) ) : ?>
                    <form method="post" action="" style="margin: 0;">
                        <?php wp_nonce_field( 'blan_clear_threats_action', 'blan_clear_threats_nonce' ); ?>
                        <input type="submit" name="blan_clear_threats" class="button button-small" value="Clear Logs" style="background: #334155; border: 1px solid #475569; color: #cbd5e1; cursor: pointer; border-radius: 6px;" />
                    </form>
                    <?php endif; ?>
                </div>

                <?php if ( empty( $threat_logs ) ) : ?>
                    <p style="color: #64748b; font-size: 12px; margin: 10px 0;">No security threats or php2shell injection attempts detected. Site is operating securely.</p>
                <?php else : ?>
                    <div style="max-height: 240px; overflow-y: auto; font-family: monospace; font-size: 11px;">
                        <table style="width: 100%; border-collapse: collapse; color: #cbd5e1;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 1px solid #334155; color: #94a3b8;">
                                    <th style="padding: 8px;">Date</th>
                                    <th style="padding: 8px;">Source IP</th>
                                    <th style="padding: 8px;">Rule Triggered</th>
                                    <th style="padding: 8px;">Vector</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ( array_slice( $threat_logs, 0, 15 ) as $log ) : ?>
                                <tr style="border-bottom: 1px solid #0f172a;">
                                    <td style="padding: 8px;"><?php echo esc_html( $log['date'] ); ?></td>
                                    <td style="padding: 8px;"><?php echo esc_html( $log['ip'] ); ?></td>
                                    <td style="padding: 8px; color: #f87171; font-weight: bold;"><?php echo esc_html( $log['rule'] ); ?></td>
                                    <td style="padding: 8px; color: #94a3b8;"><?php echo esc_html( $log['source'] ); ?></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
    <?php
}
