<?php
/**
 * B-LAN AI PHP2Shell Defense Shield
 * 
 * Protects WordPress sites and B-LAN nodes against modern AI-assisted PHP web shell
 * droppers, dynamic execution vectors, stream wrapper abuses, and reverse shells.
 * Requires PHP 8.3.13 or higher.
 * 
 * @package B_LAN_Plugin
 * @version 3.2.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enforce PHP 8.3.13+ runtime compatibility.
 */
function blan_check_php_requirement() {
    return version_compare( PHP_VERSION, BLAN_MIN_PHP_VERSION, '>=' );
}

/**
 * Main AI PHP2Shell Guard hook. Runs early on 'init'.
 */
add_action( 'init', 'blan_guard_against_ai_php2shell', 1 );
function blan_guard_against_ai_php2shell() {
    // Only inspect requests if not running in CLI mode
    if ( php_sapi_name() === 'cli' ) {
        return;
    }

    // CRITICAL: Exempt authenticated site administrators within wp-admin
    // Prevents admin page timeouts, false-positive blocks, and nonce interference
    if ( is_admin() && is_user_logged_in() && current_user_can( 'manage_options' ) ) {
        return;
    }

    // Modern AI php2shell threat signatures (bounded regexes to prevent ReDoS CPU exhaustion)
    $signatures = array(
        'obfuscated_exec' => '/(eval|assert|passthru|shell_exec|system|proc_open|popen)\s*\(\s*(base64_decode|gzinflate|str_rot13|hex2bin|chr|pack)/i',
        'raw_exec_call'   => '/(\bpassthru|\bshell_exec|\bexec|\bsystem|\bproc_open|\bpopen|\bpcntl_exec)\s*\(/i',
        'stream_wrapper'  => '/(phar|php|data|expect|compress\.zlib|zip|glob):\/\//i',
        'shell_spawn'     => '/(\/bin\/(sh|bash|zsh|dash)|cmd\.exe|powershell(\.exe)?|\/dev\/tcp\/\d+)/i',
        'inline_php_tag'  => '/<\?(php|=)/i',
        'magic_var_func'  => '/\$(?:GLOBALS|_POST|_GET|_COOKIE|_REQUEST)\[[^\]]{1,64}\]\s*\(/i',
        'php2shell_regex' => '/(\bpreg_replace\b\s*\([^\)]{0,120}\/e[\'"])/i'
    );

    // Collect query, post body, and request URI for inspection
    $inspect_targets = array();
    
    if ( ! empty( $_GET ) ) {
        $inspect_targets['GET'] = json_encode( $_GET );
    }
    if ( ! empty( $_POST ) ) {
        $inspect_targets['POST'] = json_encode( $_POST );
    }
    if ( ! empty( $_COOKIE ) ) {
        // Only inspect blan-related cookies to prevent false positives with session cookies
        foreach ( $_COOKIE as $k => $v ) {
            if ( str_contains( (string) $k, 'blan' ) ) {
                $inspect_targets['COOKIE:' . $k] = is_string( $v ) ? $v : json_encode( $v );
            }
        }
    }
    if ( ! empty( $_SERVER['REQUEST_URI'] ) ) {
        $inspect_targets['URI'] = (string) $_SERVER['REQUEST_URI'];
    }

    foreach ( $inspect_targets as $source => $payload ) {
        if ( ! is_string( $payload ) ) {
            continue;
        }

        // Bound payload length to 12,000 characters to prevent ReDoS / CPU timeouts
        $bounded_payload = substr( $payload, 0, 12000 );

        foreach ( $signatures as $rule_name => $pattern ) {
            if ( preg_match( $pattern, $bounded_payload ) ) {
                // Suspicious payload detected! Log the incident
                blan_log_security_threat( $rule_name, $source, $bounded_payload );

                // Terminate request with 403 Forbidden
                status_header( 403 );
                nocache_headers();
                wp_die(
                    sprintf(
                        '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:40px auto;padding:24px;border-radius:12px;background:#0f172a;color:#f87171;border:1px solid #7f1d1d;">' .
                        '<h2 style="color:#ef4444;margin-top:0;">🛡️ B-LAN AI PHP2Shell Defense Shield</h2>' .
                        '<p style="color:#f1f5f9;font-size:14px;line-height:1.6;">Request blocked by B-LAN Security Shield: potential web shell injection or dangerous execution vector detected.</p>' .
                        '<div style="background:#1e293b;padding:12px;border-radius:6px;font-family:monospace;font-size:12px;color:#94a3b8;margin:15px 0;">Rule Triggered: %s | Threat Vector: %s</div>' .
                        '<p style="color:#64748b;font-size:12px;">This node strictly enforces PHP 8.3.13+ security sandboxing against AI-assisted remote code execution.</p>' .
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

/**
 * Log intercepted security threat.
 */
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
    if ( ! is_array( $threat_logs ) ) {
        $threat_logs = array();
    }

    // Keep the latest 50 security records
    array_unshift( $threat_logs, $log_entry );
    $threat_logs = array_slice( $threat_logs, 0, 50 );

    update_option( 'blan_security_threat_logs', $threat_logs, false );
}

/**
 * Sanitize node URL strictly, preventing stream wrappers and directory traversal.
 */
function blan_sanitize_node_url( $url ) {
    $url = trim( (string) $url );
    
    // Disallow dangerous stream protocols
    if ( preg_match( '/^(phar|php|data|expect|file|zip|glob):/i', $url ) ) {
        return 'http://localhost:3000';
    }

    // Must be http or https
    if ( ! preg_match( '/^https?:\/\//i', $url ) ) {
        $url = 'http://' . $url;
    }

    // Validate valid URL structure
    $sanitized = esc_url_raw( $url, array( 'http', 'https' ) );
    return ! empty( $sanitized ) ? $sanitized : 'http://localhost:3000';
}
