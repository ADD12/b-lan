/**
 * Frontend script for B-LAN Plugin V.3.2.0
 * Supports Lite Sign-Up, Member Profile, and Community Directory
 */
(function($) {
    'use strict';

    $(document).ready(function() {
        var nodeUrl = (window.blanSettings && window.blanSettings.nodeUrl) || 'http://localhost:3000';
        var communityId = (window.blanSettings && window.blanSettings.communityId) || 'CIM-99';

        // 1. Initialize Lite Sign-Up Portal if present
        if ($('#blan-signup-root').length) {
            initLiteSignup(nodeUrl, communityId);
        }

        // 2. Load B-LAN Profile Card if present
        if ($('#blan-profile-root').length) {
            fetchProfileData(nodeUrl);
        }

        // 3. Load B-LAN Community Directory Card if present
        if ($('#blan-directory-root').length) {
            fetchDirectoryData(nodeUrl);
        }
    });

    /**
     * Initializes Lite Sign-Up Form
     */
    function initLiteSignup(nodeUrl, communityId) {
        var form = $('#blan-lite-signup-form');
        var successBox = $('#blan-signup-success');
        var submitBtn = $('#blan-signup-btn');

        form.on('submit', function(e) {
            e.preventDefault();

            var name = $.trim($('#blan_reg_name').val());
            var sector = $('#blan_reg_sector').val();
            var skill = $('#blan_reg_skill').val();
            var solarWatts = parseInt($('#blan_reg_solar').val(), 10) || 500;

            if (!name) {
                alert('Please enter your name or mesh alias.');
                return;
            }

            submitBtn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Minting Shard on Mesh...');

            // Generate deterministic or random PIM identifier
            var randomHex = Math.floor(Math.random() * 0xFFFFF).toString(16).toUpperCase().padStart(5, '0');
            var shardId = 'PIM-' + communityId + '-' + randomHex;
            var seed = encodeURIComponent(name.replace(/\s+/g, ''));
            var avatarUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + seed;

            var newCitizen = {
                id: Date.now(),
                shardId: shardId,
                name: name,
                address: sector,
                karmaBalance: 600, // 500 base + 100 Welcome Karma Grant
                solarWatts: solarWatts,
                skills: [skill, 'Local Peer Node'],
                avatar: avatarUrl,
                joinedAt: new Date().toISOString()
            };

            // 1. Save to local-first browser cache
            try {
                localStorage.setItem('current_auth_user', JSON.stringify(newCitizen));
                var registry = JSON.parse(localStorage.getItem('user_registry')) || [];
                registry.unshift(newCitizen);
                localStorage.setItem('user_registry', JSON.stringify(registry));
            } catch(err) {
                console.warn('LocalStorage unavailable:', err);
            }

            // 2. Attempt lightweight broadcast to local physical node (non-blocking)
            try {
                if (window.fetch) {
                    fetch(nodeUrl + '/api/mesh/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newCitizen),
                        mode: 'cors'
                    }).catch(function() {
                        // Offline mesh node fallback - perfectly normal for local-first
                    });
                }
            } catch(e) {}

            // 3. Render Instant Success Passport
            setTimeout(function() {
                form.slideUp(200);

                var profileUrl = (window.blanSettings && window.blanSettings.profileUrl) || '/blan-profile/';
                var directoryUrl = (window.blanSettings && window.blanSettings.directoryUrl) || '/blan-directory/';

                var successHtml = `
                    <div class="blan-success-card">
                        <div class="blan-success-header">
                            <div class="blan-success-icon"><i class="fa-solid fa-circle-check"></i></div>
                            <div>
                                <h4 class="blan-success-title">Welcome to the Mesh, ${escapeHtml(name)}!</h4>
                                <p class="blan-success-subtitle">PIM Shard Minted &amp; Synchronized with ${escapeHtml(communityId)}</p>
                            </div>
                        </div>

                        <div class="blan-passport-summary">
                            <div class="blan-passport-avatar-wrap">
                                <img src="${avatarUrl}" class="blan-avatar" alt="Avatar">
                            </div>
                            <div class="blan-passport-details">
                                <div class="blan-passport-id"><i class="fa-solid fa-fingerprint"></i> ${shardId}</div>
                                <div class="blan-passport-meta"><strong>Sector:</strong> ${escapeHtml(sector)}</div>
                                <div class="blan-passport-meta"><strong>Primary Skill:</strong> ${escapeHtml(skill)}</div>
                                <div class="blan-passport-meta"><strong>Starting Karma:</strong> <span style="color:#818cf8; font-weight:bold;">600 K (+100 Welcome Grant)</span></div>
                                <div class="blan-passport-meta"><strong>Solar Pledged:</strong> <span style="color:#fbbf24; font-weight:bold;">${solarWatts.toLocaleString()} Wh</span></div>
                            </div>
                        </div>

                        <div class="blan-success-nav">
                            <a href="${profileUrl}" class="blan-btn blan-btn-primary">
                                <i class="fa-solid fa-id-badge"></i> View Member Profile
                            </a>
                            <a href="${directoryUrl}" class="blan-btn blan-btn-secondary">
                                <i class="fa-solid fa-users"></i> Explore Directory
                            </a>
                        </div>
                    </div>
                `;

                successBox.html(successHtml).fadeIn(300);
            }, 600);
        });
    }

    /**
     * Fetches current PIM Profile from local B-LAN database
     */
    function fetchProfileData(nodeUrl) {
        var root = $('#blan-profile-root');

        // Check localStorage as local-first fallback simulation
        var cachedUser = null;
        try {
            cachedUser = JSON.parse(localStorage.getItem('current_auth_user'));
        } catch(e) {}

        // Fallback profile if node is offline and no cache exists
        var fallbackProfile = {
            name: "John Neighbor",
            address: "Sector B-4, Unit 12",
            karmaBalance: 520,
            solarWatts: 1450,
            skills: ["General Labor", "SDR Radio Setup", "Solar Maintenance"],
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=JohnNeighbor"
        };

        var user = cachedUser || fallbackProfile;

        // Simulate local-first dynamic mesh sync
        setTimeout(function() {
            var html = `
                <div class="blan-card">
                    <div class="blan-profile-header">
                        <img src="${user.avatar}" class="blan-avatar" alt="Avatar">
                        <div>
                            <h4 class="blan-name">${escapeHtml(user.name)}</h4>
                            <p class="blan-address"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(user.address)}</p>
                        </div>
                    </div>
                    
                    <div class="blan-stats-grid">
                        <div class="blan-stat-box">
                            <div class="blan-stat-label">Karma Trust Balance</div>
                            <div class="blan-stat-value karma">${user.karmaBalance} K</div>
                        </div>
                        <div class="blan-stat-box">
                            <div class="blan-stat-label">Solar Watts Reserve</div>
                            <div class="blan-stat-value solar">${(user.solarWatts || 1000).toLocaleString()} Wh</div>
                        </div>
                    </div>

                    <div class="blan-skills-section">
                        <div class="blan-skills-title">Active PIM Skills</div>
                        <div class="blan-skills-list">
                            ${(user.skills || []).map(function(skill) { return `<span class="blan-skill-tag">${escapeHtml(skill)}</span>`; }).join('')}
                        </div>
                    </div>
                </div>
            `;
            root.html(html);
        }, 500);
    }

    /**
     * Fetches community directory mesh shards
     */
    function fetchDirectoryData(nodeUrl) {
        var root = $('#blan-directory-root');

        var fallbackMembers = [
            { id: 1, name: "Alice Shard", address: "Sector A-1, Unit 09", karmaBalance: 1200, solarWatts: 4500, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alice" },
            { id: 2, name: "Bob Node", address: "Sector B-2, Unit 04", karmaBalance: 320, solarWatts: 120, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Bob" },
            { id: 3, name: "Charlie Mesh", address: "Sector B-4, Unit 01", karmaBalance: 850, solarWatts: 2400, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Charlie" },
            { id: 4, name: "Diana Fox", address: "Sector C-1, Unit 15", karmaBalance: 610, solarWatts: 950, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Diana" },
            { id: 5, name: "Ethan Solar", address: "Sector C-3, Unit 22", karmaBalance: 980, solarWatts: 3800, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ethan" }
        ];

        // Retrieve user registry if available in storage
        var registry = [];
        try {
            registry = JSON.parse(localStorage.getItem('user_registry')) || [];
        } catch(e) {}

        var members = registry.length > 0 ? registry.concat(fallbackMembers) : fallbackMembers;

        setTimeout(function() {
            var html = `<div class="blan-directory-grid">`;
            
            members.forEach(function(m) {
                var avatar = m.avatar || ('https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(m.name));
                html += `
                    <div class="blan-member-card">
                        <div class="blan-member-info">
                            <img src="${avatar}" class="blan-member-avatar" alt="Member Avatar">
                            <div>
                                <h5 class="blan-member-name">${escapeHtml(m.name)}</h5>
                                <p class="blan-member-address">${escapeHtml(m.address || 'Sector B-4, Mesh Unit')}</p>
                            </div>
                        </div>
                        <div class="blan-member-stats">
                            <span style="color: #a5b4fc;"><i class="fa-solid fa-coins"></i> ${m.karmaBalance || 500} K</span>
                            <span style="color: #fbbf24;"><i class="fa-solid fa-bolt"></i> ${(m.solarWatts || 1000).toLocaleString()} Wh</span>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            root.html(html);
        }, 500);
    }

    function escapeHtml(string) {
        if (!string) return '';
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;',
                '`': '&#x60;',
                '=': '&#x3D;'
            })[s];
        });
    }

})(jQuery);
