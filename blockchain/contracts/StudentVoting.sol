// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StudentVoting — ACOMSS 2026-2027 Elections
/// @notice Secure blockchain voting contract with whitelist-based identity verification
contract StudentVoting {
    // ─────────────────────────────────────────────────────────────
    // Structs
    // ─────────────────────────────────────────────────────────────

    struct Position {
        uint256 id;
        string name;
        bool active;
    }

    struct Candidate {
        uint256 id;
        string name;
        uint256 positionId;
        uint256 voteCount;
        bool active;
    }

    // ─────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────

    address public admin;
    bool public votingOpen;

    uint256 private _positionCounter;
    uint256 private _candidateCounter;

    Position[] private _positions;
    Candidate[] private _candidates;

    mapping(bytes32 => bool) public authorizedVoters;
    mapping(bytes32 => bool) public hasVoted;

    // ─────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────

    event VoterAuthorized(bytes32 indexed voterId);
    event VoterRevoked(bytes32 indexed voterId);
    event PositionAdded(uint256 indexed id, string name);
    event PositionRemoved(uint256 indexed id);
    event CandidateAdded(uint256 indexed id, string name, uint256 positionId);
    event CandidateRemoved(uint256 indexed id);
    event VotingOpened();
    event VotingClosed();
    event VoteCast(bytes32 indexed voterId);

    // ─────────────────────────────────────────────────────────────
    // Modifiers
    // ─────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier whenOpen() {
        require(votingOpen, "Voting is not open");
        _;
    }

    modifier whenClosed() {
        require(!votingOpen, "Voting is still open");
        _;
    }

    // ─────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        votingOpen = false;
    }

    // ─────────────────────────────────────────────────────────────
    // Admin — Whitelist
    // ─────────────────────────────────────────────────────────────

    function authorizeVoter(bytes32 voterId) external onlyAdmin {
        require(voterId != bytes32(0), "Invalid voter");
        require(!authorizedVoters[voterId], "Already authorized");
        authorizedVoters[voterId] = true;
        emit VoterAuthorized(voterId);
    }

    function revokeVoter(bytes32 voterId) external onlyAdmin {
        require(authorizedVoters[voterId], "Not authorized");
        authorizedVoters[voterId] = false;
        emit VoterRevoked(voterId);
    }

    // ─────────────────────────────────────────────────────────────
    // Admin — Positions
    // ─────────────────────────────────────────────────────────────

    function addPosition(string calldata name) external onlyAdmin whenClosed {
        require(bytes(name).length > 0, "Name required");
        _positionCounter++;
        _positions.push(Position({ id: _positionCounter, name: name, active: true }));
        emit PositionAdded(_positionCounter, name);
    }

    function removePosition(uint256 positionId) external onlyAdmin whenClosed {
        for (uint256 i = 0; i < _positions.length; i++) {
            if (_positions[i].id == positionId && _positions[i].active) {
                _positions[i].active = false;
                emit PositionRemoved(positionId);
                return;
            }
        }
        revert("Position not found");
    }

    // ─────────────────────────────────────────────────────────────
    // Admin — Candidates
    // ─────────────────────────────────────────────────────────────

    function addCandidate(string calldata name, uint256 positionId) external onlyAdmin whenClosed {
        require(bytes(name).length > 0, "Name required");
        bool positionExists = false;
        for (uint256 i = 0; i < _positions.length; i++) {
            if (_positions[i].id == positionId && _positions[i].active) {
                positionExists = true;
                break;
            }
        }
        require(positionExists, "Position does not exist");

        _candidateCounter++;
        _candidates.push(Candidate({
            id: _candidateCounter,
            name: name,
            positionId: positionId,
            voteCount: 0,
            active: true
        }));
        emit CandidateAdded(_candidateCounter, name, positionId);
    }

    function removeCandidate(uint256 candidateId) external onlyAdmin whenClosed {
        for (uint256 i = 0; i < _candidates.length; i++) {
            if (_candidates[i].id == candidateId && _candidates[i].active) {
                _candidates[i].active = false;
                emit CandidateRemoved(candidateId);
                return;
            }
        }
        revert("Candidate not found");
    }

    // ─────────────────────────────────────────────────────────────
    // Admin — Election Control
    // ─────────────────────────────────────────────────────────────

    function openVoting() external onlyAdmin whenClosed {
        uint256 activePositions = 0;
        uint256 activeCandidates = 0;

        for (uint256 i = 0; i < _positions.length; i++) {
            if (_positions[i].active) activePositions++;
        }

        for (uint256 i = 0; i < _candidates.length; i++) {
            if (_candidates[i].active) activeCandidates++;
        }

        require(activePositions > 0, "No active positions");
        require(activeCandidates > 0, "No active candidates");
        votingOpen = true;
        emit VotingOpened();
    }

    function closeVoting() external onlyAdmin whenOpen {
        votingOpen = false;
        emit VotingClosed();
    }

    // ─────────────────────────────────────────────────────────────
    // Student — Vote
    // ─────────────────────────────────────────────────────────────

    /// @notice Cast votes for multiple positions in one transaction
    /// @param positionIds Array of position IDs being voted on
    /// @param candidateIds Array of candidate IDs (must match positionIds by index)
    function vote(bytes32 voterId, uint256[] calldata positionIds, uint256[] calldata candidateIds)
        external
        onlyAdmin
        whenOpen
    {
        require(authorizedVoters[voterId], "Not authorized");
        require(!hasVoted[voterId], "Already voted");
        require(positionIds.length == candidateIds.length, "Array length mismatch");
        require(positionIds.length > 0, "No votes provided");

        for (uint256 i = 0; i < positionIds.length; i++) {
            for (uint256 k = i + 1; k < positionIds.length; k++) {
                require(positionIds[i] != positionIds[k], "Duplicate position");
            }

            uint256 pid = positionIds[i];
            uint256 cid = candidateIds[i];

            // Validate candidate belongs to the given position
            bool valid = false;
            for (uint256 j = 0; j < _candidates.length; j++) {
                if (
                    _candidates[j].id == cid &&
                    _candidates[j].positionId == pid &&
                    _candidates[j].active
                ) {
                    _candidates[j].voteCount++;
                    valid = true;
                    break;
                }
            }
            require(valid, "Invalid candidate for position");
        }

        hasVoted[voterId] = true;
        emit VoteCast(voterId);
    }

    // ─────────────────────────────────────────────────────────────
    // Public Reads
    // ─────────────────────────────────────────────────────────────

    function getPositions() external view returns (Position[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _positions.length; i++) {
            if (_positions[i].active) count++;
        }
        Position[] memory active = new Position[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < _positions.length; i++) {
            if (_positions[i].active) active[idx++] = _positions[i];
        }
        return active;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _candidates.length; i++) {
            if (_candidates[i].active) count++;
        }
        Candidate[] memory active = new Candidate[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < _candidates.length; i++) {
            if (_candidates[i].active) active[idx++] = _candidates[i];
        }
        return active;
    }

    /// @notice Returns results — only available after voting is closed
    function getResults() external view whenClosed returns (Candidate[] memory) {
        return this.getCandidates();
    }

    function getVotingStatus() external view returns (bool) {
        return votingOpen;
    }
}
